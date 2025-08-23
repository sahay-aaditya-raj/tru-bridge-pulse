# test_client.py
from routine_check import socketio, app

# Create a test client
test_client = socketio.test_client(app)

def get_bot_messages():
    """Helper to fetch bot replies nicely."""
    received = test_client.get_received()
    messages = []
    for packet in received:
        if packet["name"] == "message":
            messages.append(packet["args"])
    return messages

# Print the initial welcome message
for msg in get_bot_messages():
    print(f"🤖 Bot: {msg}")

# Interactive loop
while True:
    user_input = input("🧑 You: ")
    if user_input.lower() in ["exit", "quit"]:
        break
    test_client.emit("message", user_input)
    for msg in get_bot_messages():
        print(f"🤖 Bot: {msg}")
    if "EXIT" in msg:
        print(f"Exiting the chat....")
        break