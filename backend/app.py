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
    Parse the CSV file and extract transaction data.
    Returns the top 10 most recent transactions based on Transaction Date.
    """
    transactions = []
    try:
        with open(filename, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Attempt to parse the "Transaction Date" (adjust the key name if necessary)
                transaction_date_str = row.get("Transaction Date", "").strip()
                if not transaction_date_str:
                    continue
                try:
                    transaction_date = datetime.strptime(transaction_date_str, "%Y-%m-%d")
                except Exception as e:
                    # Skip rows with an invalid date
                    continue
                    
                # Parse debit and credit amounts
                try:
                    debit = float(row.get("Debit", "0").strip() or "0")
                except Exception as e:
                    debit = 0.0

                try:
                    credit = float(row.get("Credit", "0").strip() or "0")
                except Exception as e:
                    credit = 0.0

                transaction = {
                    "transactionDate": transaction_date_str,
                    "postedDate": row.get("Posted Date", "").strip(),
                    "cardNo": row.get("Card No.", "").strip(),
                    "description": row.get("Description", "").strip(),
                    "category": row.get("Category", "").strip(),
                    "debit": debit,
                    "credit": credit
                }
                transactions.append(transaction)
    except Exception as e:
        print(f"Error processing CSV file: {e}")

    # Sort the transactions by transactionDate (most recent first)
    transactions.sort(key=lambda x: datetime.strptime(x["transactionDate"], "%Y-%m-%d"), reverse=True)

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

    #actions = gemini.analyzeCSV(csvfilename)
    gemini.initChat(csvfilename)

    top_transactions = parse_csv_for_transactions(csvfilename)

    os.remove(csvfilename)

    return jsonify({
        #"actions": actions,
        "top_transactions": top_transactions
    })

@app.route("/new_transaction", methods=["POST"])
def new_transaction():
    data = request.form

    return jsonify(gemini.newTransaction(data))

if __name__ == "__main__":
    app.run(debug=True, port=5001, host = '0.0.0.0')