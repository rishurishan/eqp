from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_cors import CORS  # Import CORS
from auth import authenticate

app = Flask(__name__)
CORS(app)  # Apply CORS to your Flask app
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
jwt = JWTManager(app)

# Mock user data
users = {
    "rshav44@gmail.com": "admin"  # Replace with actual user data from database
}

@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic auth="Login required"'}), 401

    if authenticate(auth.username, auth.password):
        access_token = create_access_token(identity=auth.username)
        return jsonify(access_token=access_token), 200

    return jsonify({'message': 'Invalid credentials'}), 401


if __name__ == '__main__':
    app.run(debug=True)
