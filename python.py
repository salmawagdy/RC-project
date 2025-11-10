from flask import Flask, request, jsonify
from datetime import datetime
import json

app = Flask(__name__)

from flask_cors import CORS
CORS(app)


def get_purchases():
    try:
        file = open("file.json", "r")
        content = file.read()
        file.close()
        if content.strip() == "":
            return []
        purchases = json.loads(content)
        return purchases
    except FileNotFoundError:
        return []

def save_purchases(purchases):
    file = open("file.json", "w")
    file.write(json.dumps(purchases, indent=4))
    file.close()

@app.route("/add_purchase", methods=["POST"])
def add_purchase():
    data = request.get_json()
    name = data.get("name")
    amount = data.get("amount")
    date = data.get("date")  

    if not name or not amount or not date:
        return jsonify({"status": "warning", "message": "Missing information"}), 400

    if name.isdigit():
        return jsonify({"status": "error", "message": "Purchase name cannot be only numbers"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"status": "error", "message": "Amount must be positive"}), 400
    except ValueError:
        return jsonify({"status": "error", "message": "Amount must be a number"}), 400

    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        today = datetime.today()
        if date_obj > today:
            return jsonify({"status": "error", "message": "Date cannot be in the future"}), 400
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format"}), 400

    purchases = get_purchases()
    purchase = {"name": name, "amount": amount, "date": date}
    purchases.append(purchase)
    save_purchases(purchases)

    return jsonify({"status": "success", "message": "Purchase added successfully!"}), 200

@app.route("/purchases", methods=["GET"])
def all_purchases():
    return jsonify({"purchases": get_purchases()}), 200

@app.route("/update_purchase", methods=["PUT"])
def update_purchase():
    data = request.get_json()
    purchases = get_purchases()
    for p in purchases:
        if p["name"] == data["oldName"]:
            p["name"] = data["name"]
            p["amount"] = data["amount"]
            p["date"] = data["date"]
            break
    save_purchases(purchases)
    return jsonify({"status": "success"}), 200

@app.route("/delete_purchase", methods=["DELETE"])
def delete_purchase():
    data = request.get_json()
    purchases = get_purchases()
    purchases = [p for p in purchases if p["name"] != data["name"]]
    save_purchases(purchases)
    return jsonify({"status": "success"}), 200


if __name__ == "__main__":
    app.run(port=5000,debug=True)

