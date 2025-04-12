from flask import Flask, request, jsonify
from flask_cors import CORS

from datetime import datetime
import os

import gemini

csvpath = os.environ["CSVPATH"]
csvfilename = ""

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
    csvfilename = csvpath + f"{timestamp}_{file.filename}"

    file.save(csvfilename)

    print(f"Received frame: {file.filename}")

    actions = gemini.analyzeCSV(csvfilename)
    gemini.initChat(csvfilename)

    os.remove(csvfilename)

    return jsonify(actions)

@app.route("/new_transaction", methods=["POST"])
def new_transaction():
    data = request.form

    return jsonify(gemini.newTransaction(data))

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')