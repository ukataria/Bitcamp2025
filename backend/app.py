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

    # actions = gemini.analyzeCSV(csvfilename)
    # gemini.initChat(csvfilename)

    top_transactions = parse_csv_for_transactions(csvfilename)

    os.remove(csvfilename)

    return jsonify([{"Actions": ["Prioritize public transportation or walking/biking for shorter distances.", "Compare prices between different ride-sharing apps before booking.", "Plan trips to consolidate errands and reduce the number of individual rides needed.", "Evaluate if the Uber One subscription ($9.99/month) provides sufficient savings on rides and deliveries compared to your actual usage.", "Explore carpooling options where feasible."], "Reason": "Analysis shows consistently high spending on Uber Trips (e.g., $48.83, $39.39, $47.35, $53.13, $71.69, $113.78) and Lyft (e.g., $19.70, $13.32, $48.99) across several months. This category represents a significant portion of discretionary spending.", "Title": "Reduce Ride-Sharing Costs (Uber/Lyft)"}, {"Actions": ["Increase home cooking frequency; plan meals and prep ingredients in advance.", "Set a specific weekly or monthly budget for dining out and food delivery.", "Reduce reliance on food delivery apps; opt for pickup to save on fees or cook instead.", "Limit small, frequent purchases like vending machine snacks/drinks (multiple charges of $1.85, $3.60, $7.00 etc.).", "Look for restaurant deals, happy hour specials, or loyalty programs.", "Maximize value from any existing campus dining plans (e.g., Carnegie Mellon Dining)."], "Reason": "Frequent and substantial spending occurs on food delivery (primarily Uber Eats, with multiple orders like $35.42, $34.41, $65.19, $38.87) and dining out (including frequent campus dining, Chipotle, VEND vending machines, and various restaurants). This is a major spending category with potential for significant savings.", "Title": "Optimize Food Delivery & Dining Expenses"}, {"Actions": ["Always create a shopping list before grocery shopping or visiting general merchandise stores like Target.", "Compare prices between grocery stores and consider store brands for savings.", "Analyze if grocery delivery services like Instacart are cost-effective compared to shopping in person, factoring in fees and potential impulse buys.", "Review past large shopping trips (e.g., Target) to identify patterns of non-essential spending.", "Take advantage of loyalty programs, coupons, and sales for groceries and merchandise."], "Reason": "Significant expenditures identified in the Merchandise category, including large purchases at Target ($316.95, $162.84), Instacart ($110.70, $92.68), Whole Foods ($105.13), and various smaller markets (Salem's, Trader Joe's). These add up considerably over time.", "Title": "Control Grocery & Merchandise Spending"}, {"Actions": ["Assess whether the actual savings from the Uber One subscription (e.g., delivery fee waivers, ride discounts) consistently exceed the $9.99 monthly fee.", "Regularly review credit card statements for other recurring charges or subscriptions that may no longer be necessary or frequently used."], "Reason": "The data shows a recurring charge for Uber One ($9.99 monthly), offset by statement credits. While potentially beneficial, its value depends on usage.", "Title": "Review Subscriptions & Recurring Costs"}])

@app.route("/new_transaction", methods=["POST"])
def new_transaction():
    data = request.form

    return jsonify(gemini.newTransaction(data))

if __name__ == "__main__":
    app.run(debug=True, port=5001, host = '0.0.0.0')