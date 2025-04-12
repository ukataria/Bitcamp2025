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


    top_transactions = parse_csv_for_transactions(csvfilename)


    # return jsonify({"actions" : [
    #     {
    #         "description": "Spending on Uber services (Trips and Eats) occurred 24 times between October and mid-December, totaling over $550. Reviewing this frequency could reveal savings opportunities.",
    #         "title": "High Ride-Share & Delivery Frequency",
    #         "type": "warning"
    #     },
    #     {
    #         "description": "Small purchases from vending machines ('VEND 1800-766-8728') added up to over $30 across 16 transactions since August. Packing snacks could be more cost-effective.",
    #         "title": "Vending Machine Habit",
    #         "type": "tip"
    #     },
    #     {
    #         "description": "Excellent work managing your credit! You consistently made large payments towards your balance, including $811.87 in September, $960.86 in October, and $857.84 in November.",
    #         "title": "Consistent Payment Achievement",
    #         "type": "achievement"
    #     }
    # ], "top_transactions" : top_transactions})

    actions = gemini.analyzeCSV(csvfilename)
    gemini.initChat(csvfilename)

    os.remove(csvfilename)
    return jsonify({"actions" : actions, "top_transactions" : top_transactions})

@app.route("/new_transaction", methods=["POST"])
def new_transaction():
    data = request.form

    return jsonify(gemini.newTransaction(data))

if __name__ == "__main__":
    app.run(debug=True, port=5001, host = '0.0.0.0')