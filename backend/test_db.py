from database import messages

messages.insert_one({"test": "ok"})
print("MongoDB connected!")
