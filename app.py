from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
import requests
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")  # Needed for session handling
load_dotenv()

# Load OpenRouter API Key
OPENROUTER_API_KEY = os.getenv("ENTER_YOUR_OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Contextual prompts for each mode
MODE_PROMPTS = {
    "information": "You are a helpful assistant providing clear, simple, and informative answers to senior citizens.",
    "religion": "You are a friendly religious companion. Respond to queries with stories and teachings from religious texts in a respectful and engaging way.",
    "wellness": "You are a wellness advisor for seniors. Offer advice on health, exercise, meditation, and diet in a supportive tone.",
    "order": (
        "You are an online ordering assistant for senior citizens. "
        "Help users place online orders for food, groceries, clothes, and electronics from platforms like Amazon, Flipkart, Swiggy, or Zomato. "
        "Ask for specific product names, quantities, delivery address, and payment preferences. "
        "Avoid giving general information about items — guide them step by step through the order process, as if you're helping them place it right now. "
        "Be friendly and very clear. Always confirm selections."
    )
}

@app.route("/")
def homepage():
    return render_template("homepage.html")

@app.route("/<mode>")
def mode_page(mode):
    if mode in ["information", "religion", "wellness", "order"]:
        return render_template(f"{mode}.html")
    return "Invalid mode", 404

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    user_input = data.get("query", "")
    mode = data.get("mode", "information")

    # Get previous messages from session or start new
    messages = session.get(f"chat_history_{mode}", [])
    system_prompt = MODE_PROMPTS.get(mode, MODE_PROMPTS["information"])

    if not messages:
        messages.append({"role": "system", "content": system_prompt})

    messages.append({"role": "user", "content": user_input})

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": messages
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(OPENROUTER_API_URL, json=payload, headers=headers)
        result = response.json()
        answer = result["choices"][0]["message"]["content"]

        messages.append({"role": "assistant", "content": answer})
        session[f"chat_history_{mode}"] = messages

        return jsonify({"response": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reset", methods=["POST"])
def reset():
    # Optional: Reset all modes or only one
    session.clear()
    return jsonify({"message": "Conversation reset."})

if __name__ == "__main__":
    app.run(debug=True)
