from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client.chatapp
messages = db.messages

IST_OFFSET = timedelta(hours=5, minutes=30)

fixed = 0

for m in messages.find():
    ts = m.get("timestamp")

    # Case 1: old messages → datetime without timezone
    if isinstance(ts, datetime) and ts.tzinfo is None:
        # Treat as IST → convert to UTC
        utc_ts = ts - IST_OFFSET
        utc_ts = utc_ts.replace(tzinfo=timezone.utc)

        messages.update_one(
            {"_id": m["_id"]},
            {"$set": {"timestamp": utc_ts}}
        )

        fixed += 1

print(f"✅ Fixed {fixed} old messages")
