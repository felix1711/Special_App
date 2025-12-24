# from pymongo import MongoClient
# import os
# from dotenv import load_dotenv
# import certifi

# load_dotenv()

# MONGO_URL = os.getenv("MONGO_URL")

# client = MongoClient(
#     MONGO_URL,
#     tls=True,
#     tlsCAFile=certifi.where(),
#     serverSelectionTimeoutMS=20000,
# )

# db = client["chatapp"]
# users = db["users"]
# messages = db["messages"]

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client.chatapp

users = db.users        # 👈 NEW
messages = db.messages
