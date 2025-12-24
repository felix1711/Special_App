# from fastapi import WebSocket

# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: dict[str, WebSocket] = {}

#     async def connect(self, username: str, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections[username] = websocket

#     def disconnect(self, username: str):
#         self.active_connections.pop(username, None)

#     async def send_personal_message(self, message: str, receiver: str):
#         websocket = self.active_connections.get(receiver)
#         if websocket:
#             await websocket.send_text(message)

from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)

    async def send_personal_message(self, message: dict, username: str):
        ws = self.active_connections.get(username)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, message: dict):
        for ws in self.active_connections.values():
            await ws.send_json(message)

    def get_online_users(self):
        return list(self.active_connections.keys())

