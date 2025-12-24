from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from datetime import datetime, timezone , timedelta

import json
from database import client
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import messages
from websocket_manager import ConnectionManager
from jose import JWTError
from auth import decode_token
from auth import verify_password, create_token

from database import users
from auth import hash_password
from fastapi import HTTPException

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://simmi.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    username: str
    password: str

manager = ConnectionManager()

@app.post("/register")
def register(data: AuthRequest):
    username = data.username
    password = data.password

    if users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="User already exists")

    users.insert_one({
        "username": username,
        "password": hash_password(password)
    })

    return {"status": "registered"}

@app.post("/login")
def login(data: AuthRequest):
    user = users.find_one({"username": data.username})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(data.username)
    return {"token": token}

@app.get("/users")
def get_users():
    return [
        {"username": u["username"]}
        for u in users.find({}, {"_id": 0, "username": 1})
    ]

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/messages")
def get_messages(user1: str = Query(...), user2: str = Query(...)):
    chats = messages.find({
        "$or": [
            {"sender": user1, "receiver": user2},
            {"sender": user2, "receiver": user1}
        ]
    }).sort("timestamp", 1)

    return [
        {
            "sender": c["sender"],
            "receiver": c["receiver"],
            "message": c["message"],
            "timestamp": c["timestamp"]
                .replace(tzinfo=timezone.utc)   # ensure UTC
                .isoformat()
                .replace("+00:00", "Z"),
            "seen": c.get("seen", False)
        }
        for c in chats
    ]

    
@app.post("/seen")
def mark_seen(data: dict):
    messages.update_many(
        {
            "sender": data["from"],
            "receiver": data["to"],
            "seen": False
        },
        {"$set": {"seen": True}}
    )

    return {
        "status": "ok",
        "notify": {
            "type": "seen",
            "viewer": data["to"],
            "sender": data["from"]
        }
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_token(token)
        username = payload["sub"]
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(username, websocket)

    await manager.broadcast({
        "type": "online_users",
        "users": manager.get_online_users()
    })

    try:
        while True:
            data = await websocket.receive_json()

            if not isinstance(data, dict):
                continue

            # 📞 CALL OFFER
            if data.get("type") == "call-offer":
                await manager.send_personal_message(data, data["to"])
                continue

            # 📞 CALL ANSWER
            if data.get("type") == "call-answer":
                await manager.send_personal_message(data, data["to"])
                continue

            # ❄ ICE CANDIDATE
            if data.get("type") == "ice-candidate":
                await manager.send_personal_message(data, data["to"])
                continue

            # ✍️ TYPING
            if data.get("type") == "typing":
                await manager.send_personal_message({
                    "type": "typing",
                    "from": username
                }, data["to"])
                continue
            
            # ✅ SEEN
            if data.get("type") == "seen":
                await manager.send_personal_message(
                    {
                        "type": "seen",
                        "viewer": data["viewer"]
                    },
                    data["sender"]
                )
                continue


            # 💬 CHAT MESSAGE
            receiver = data.get("to")
            message = data.get("message")

            if not receiver or not message:
                continue

            ts = datetime.now(timezone.utc)

            messages.insert_one({
                "sender": username,
                "receiver": receiver,
                "message": message,
                "timestamp": ts,
                "seen": False
            })

            response = {
                "from": username,
                "to": receiver,
                "message": message,
                "timestamp": ts.isoformat().replace("+00:00", "Z"),
                "seen": False
            }

            await manager.send_personal_message(response, receiver)

    except WebSocketDisconnect:
        manager.disconnect(username)

        await manager.broadcast({
            "type": "online_users",
            "users": manager.get_online_users()
        })
