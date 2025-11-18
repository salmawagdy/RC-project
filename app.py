from flask import Flask, request, jsonify, render_template, url_for, redirect, session
from classes.purchase import Purchase
from classes.user import User
import os
import json
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "xxxxxxxxxxxxxxxxx")
CORS(app, supports_credentials=True)

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
user_file = os.path.join(BASE_DIR, 'db', 'users.json')

@app.route("/")
def homePage():
    return render_template("index.html")


@app.route("/menu")
def menu():
    if "user_email" not in session:
        return redirect(url_for('login'))
    user_email = session["user_email"]
    users = get_file(user_file)
    user = next((u for u in users if u["email"] == user_email), None)
    purchases = user.get("purchases", []) if user else []
    purchases_reversed = list(reversed(purchases))
    
    
    return render_template('menu.html', purchases=purchases_reversed)

@app.route("/login")
def login():
    return render_template('login.html')

@app.route("/signup")
def signup():
    return render_template('signup.html')

@app.route("/check_auth", methods=["GET"])
def check_auth():
    if "user_email" not in session:
        return jsonify({"status": "warning", 'message':"Please login first "}), 401


@app.route("/logout", methods=["POST"])
def logout():
    if "user_email" not in session:  
        return jsonify({
            "status": "warning",
            "message": "Already logged out"
        })
    session.clear()
    return jsonify({
        "status": "success",
        "message": "Logged out successfully",
    })




def get_file(file_name):
    try:
        file = open(file_name, "r")
        content = file.read()
        file.close()
        if content.strip() == "":
            return []
        file_data = json.loads(content)
        return file_data
    except FileNotFoundError:
        return []

def save_to_file(file_name, file_data):
    file = open(file_name, "w")
    file.write(json.dumps(file_data, indent=4))
    file.close()

@app.route("/add_purchase", methods=["POST"])
def add_purchase():
    if "user_email" not in session:
        return jsonify({"status": "warning", 'message':"Please login first "})
    
    data = request.get_json()
    name = data.get('name')
    amount = data.get('amount')
    date = data.get('date')

    purchase = Purchase(name, amount, date)

    if purchase.is_empty(name, amount, date):
        return jsonify({"status": "warning", "message": "Missing information"}), 400
    
    if not purchase.name_is_string():
        return jsonify({"status": "error", "message": "Name cannot be only numbers"}), 400
    
    if not purchase.amount_positive():
        return jsonify({"status": "error", "message": "Amount should be postive number"}), 400
    
    if not purchase.date_is_valid():
        return jsonify({"status": "error", "message": "Date cannot be in the future"}), 400

    # Add purchase to user's purchases
    user_email = session["user_email"]
    users = get_file(user_file)
    
    for user in users:
        if user["email"] == user_email:
            if "purchases" not in user:
                user["purchases"] = []
            user["purchases"].append(purchase.to_dict())
            break
    
    save_to_file(user_file, users)

    return jsonify({"status": "success", "message": "Purchase added successfully!"}), 200

@app.route("/purchases")
def get_purchases():
    if "user_email" not in session:
        return jsonify({"status": "warning", "message": "login first"}), 401
    
    user_email = session["user_email"]
    users = get_file(user_file)
    user = next((u for u in users if u["email"] == user_email), None)
    
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    
    purchases = user.get("purchases", [])
    return jsonify({
        "status": "success",
        "purchases": purchases,
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    })

@app.route("/update_purchase", methods=["PUT"])
def update_purchase():
    if "user_email" not in session:
        return jsonify({"status": "error", "message": "Please login first"}), 401
    
    data = request.get_json()
    old_name = data.get('oldName') 
    new_name = data.get('name')
    amount = data.get('amount')
    date = data.get('date')

    purchase = Purchase(new_name, amount, date)
    
    if purchase.is_empty(new_name, amount, date):
        return jsonify({"status": "warning", "message": "Missing information"}), 400
    
    if not purchase.name_is_string():
        return jsonify({"status": "error", "message": "Name cannot be only numbers"}), 400
    
    if not purchase.amount_positive():
        return jsonify({"status": "error", "message": "Amount should be positive number"}), 400
    
    if not purchase.date_is_valid():
        return jsonify({"status": "error", "message": "Date cannot be in the future"}), 400

    user_email = session["user_email"]
    users = get_file(user_file)
    found = False

    for user in users:
        if user["email"] == user_email:
            purchases = user.get("purchases", [])
            for p in purchases:
                if p["name"] == old_name:
                    p["name"] = new_name
                    p["amount"] = amount
                    p["date"] = date
                    found = True
                    break
            break

    if not found:
        return jsonify({"status": "error", "message": "Purchase not found"}), 404

    save_to_file(user_file, users)
    
    # Get updated purchases for this user
    user = next((u for u in users if u["email"] == user_email), None)
    purchases = user.get("purchases", []) if user else []
    
    return jsonify({
        "status": "success",
        "message": "Purchase updated successfully!",
        "purchases": purchases
    }), 200

@app.route("/delete_purchase", methods=["DELETE"])
def delete_purchase():
    if "user_email" not in session:
        return jsonify({"status": "error", "message": "Please login first"}), 401
    
    data = request.get_json()
    name = data.get("name")
    amount = data.get("amount")
    date = data.get("date")
    
    user_email = session["user_email"]
    users = get_file(user_file)
    
    deleted = False
    for user in users:
        if user["email"] == user_email:
            purchases = user.get("purchases", [])
            updated_purchases = []
            
            for p in purchases:
                p_amount = float(p["amount"]) if isinstance(p["amount"], (int, float, str)) else p["amount"]
                req_amount = float(amount) if isinstance(amount, (int, float, str)) else amount
                
                if not deleted and p["name"] == name and p_amount == req_amount and p["date"] == date:
                    deleted = True
                    continue
                updated_purchases.append(p)
            
            user["purchases"] = updated_purchases
            break

    if not deleted:
        return jsonify({
            "status": "error",
            "message": "Purchase not found",
            "searched_for": {"name": name, "amount": amount, "date": date}
        }), 404
    
    save_to_file(user_file, users)
    
    return jsonify({
        "status": "success",
        "message": "Purchase deleted successfully!",
        "purchases": updated_purchases
    }), 200

@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    user = User(email=email, password=password, name=name, confirm_password=confirm_password)

    if user.is_empty(name, email, password, confirm_password):
        return jsonify({"status": "warning", "message": "Missing information"}), 400

    if not user.username_is_string(name):
        return jsonify({"status": "error", "message": "Name cannot be only numbers"}), 400

    if not user.passwords_match(password, confirm_password):
        return jsonify({"status": "error", "message": "Passwords do not match"}), 400

    if not user.is_valid_password(password):
        return jsonify({"status": "error", "message": "Password must have 8+ chars, uppercase, lowercase, number, special char"}), 400

    if not user.is_valid_email(email):
        return jsonify({"status": "error", "message": "Invalid email"}), 400

    users = get_file(user_file)  

    if any(u["email"] == email for u in users):
        return jsonify({"status": "error", "message": "Email already registered"}), 400
    
    new_user = {
        "name": name,
        "email": email,
        "password": password,
        "purchases": []
    }
    users.append(new_user)
    save_to_file(user_file, users)

    return jsonify({"status": "success", "redirect": "/login"}), 200

@app.route("/login_user", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User(email=email, password=password, name=None, confirm_password=None)

    if user.login_fields_empty(email=email, password=password):
        return jsonify({"status": "warning", "message": "Missing information"}), 400

    users = get_file(user_file) 

    found_user = next((u for u in users if u["email"] == email and u["password"] == password), None)

    if not found_user:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401
    
    session.clear()
    session["user_email"] = email
    session["user_name"] = found_user["name"]
    session.permanent = True

    return jsonify({
        "status": "success",
        "redirect": "/",
        "user": {
            "name": found_user["name"],
            "email": email
        }
    }), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)