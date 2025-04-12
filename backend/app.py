from flask import Flask, request, jsonify
from flask_cors import CORS

from datetime import datetime
import os

from gemini import analyzeCSV

csvpath = os.environ["CSVPATH"]

app = Flask(__name__)
CORS(app) 

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "idk lmao"}), 200

@app.route("/analyze_spending", methods=["POST"])
def analyze_chunk():
    file = request.files.get("csv")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = f"{timestamp}_{file.filename}"

    file.save(csvpath + filename)

    print(f"Received frame: {file.filename}")

    actions = analyzeCSV(csvpath + filename)

    os.remove(csvpath + filename)

    return jsonify(actions)

if __name__ == "__main__":
    app.run(debug=True, port=5000)