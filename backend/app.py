from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "idk lmao"}), 200

@app.route("/analyze_chunk", methods=["POST"])
def analyze_chunk():
    file = request.files.get("frame")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    print(f"Received frame: {file.filename}")
    return jsonify({
        "alert": True,
        "summary": "Person stole my backpack, self-destruct the backpack "
    }), 200

if __name___ == "__main__":
    app.run(debug=True, port=5000)