from flask import Flask, request, jsonify
from flask_cors import CORS

from datetime import datetime
import os
import gemini
import csv

csvpath = os.environ["CSVPATH"]
csvfilename = ""

app = Flask(__name__)
CORS(app) 

def parse_csv_for_transactions(filename):
    """
    Parse the CSV file with columns like:
      Transaction Date, Post Date, Description, Category, Type, Amount
    Returns the top 10 most recent transactions based on 'Transaction Date'.
    """
    transactions = []
    try:
        with open(filename, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                transaction_date_str = row.get("Transaction Date", "").strip()
                if not transaction_date_str:
                    continue
                
                try:
                    transaction_date = datetime.strptime(transaction_date_str, "%m/%d/%Y")
                except ValueError:
                    continue

                amount_str = row.get("Amount", "").strip() or "0"
                try:
                    amount = float(amount_str)
                except ValueError:
                    amount = 0.0

                transaction = {
                    "transactionDate": transaction_date_str,
                    "postDate": row.get("Post Date", "").strip(),
                    "description": row.get("Description", "").strip(),
                    "category": row.get("Category", "").strip(),
                    "type": row.get("Type", "").strip(),
                    "amount": amount
                }
                transactions.append(transaction)
    except Exception as e:
        print(f"Error processing CSV file: {e}")

    # Sort transactions by transactionDate descending
    transactions.sort(
        key=lambda x: datetime.strptime(x["transactionDate"], "%m/%d/%Y"), 
        reverse=True
    )

    # Return the top 10 transactions
    return transactions[:10]

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

    top_transactions = parse_csv_for_transactions(csvfilename)

    os.remove(csvfilename)

    return jsonify({
        "actions": actions,
        "top_transactions": top_transactions
    })

@app.route("/new_transaction", methods=["POST"])
def new_transaction():
    data = request.form

    return jsonify(gemini.newTransaction(data))

if __name__ == "__main__":
    app.run(debug=True, port=5001, host = '0.0.0.0')