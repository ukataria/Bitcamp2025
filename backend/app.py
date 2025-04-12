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


    top_transactions = parse_csv_for_transactions(csvfilename)


#     return jsonify({
#     "actions": {
#         "categorical": [
#             {
#                 "points": [
#                     "Your grocery spending has been relatively stable over the past few months.",
#                     "Consider using coupons or loyalty programs to save on grocery purchases.",
#                     "Your frequent grocery stores include UMD Dining Venues and Lidl."
#                 ],
#                 "type": "groceries"
#             },
#             {
#                 "points": [
#                     "Your recent travel spending includes flights with United Airlines and transportation using Smart Trip.",
#                     "Evaluate the cost-effectiveness of different transportation options for your regular routes.",
#                     "Consider booking flights in advance to take advantage of lower fares."
#                 ],
#                 "type": "travel"
#             },
#             {
#                 "points": [
#                     "You frequently dine at Taco Bell and Moge Tee College Park.",
#                     "Consider exploring new dining options to diversify your food experiences.",
#                     "Your average meal expense is slightly above the average for similar households."
#                 ],
#                 "type": "meals"
#             },
#             {
#                 "points": [
#                     "Your recent entertainment expenses include a visit to Wynwood Walls Tour and a Fliff transaction.",
#                     "Consider setting a monthly entertainment budget to manage your spending in this category.",
#                     "Explore free or low-cost entertainment options in your area."
#                 ],
#                 "type": "entertainment"
#             }
#         ],
#         "general": [
#             {
#                 "description": "You've spent almost the exact same amount on Food & Drink for the last 3 months, indicating a high level of routine in your eating habits. Consider exploring new restaurants or cooking at home more often to diversify your spending and potentially save money.",
#                 "title": "Consistent Spending Alert",
#                 "type": "warning"
#             },
#             {
#                 "description": "Categorizing all your transactions will allow you to track your budget more efficiently. If you have transactions that do not have a category, consider adding one.",
#                 "title": "Budget Tracking Tip",
#                 "type": "tip"
#             },
#             {
#                 "description": "Congratulations! Your travel expenses are 30% lower this month compared to the previous month. Keep up the good work in managing your travel budget!",
#                 "title": "Reduced Travel Expenses",
#                 "type": "achievement"
#             }
#         ]
#     },
#     "top_transactions": []
# })

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