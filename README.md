# CapitalClarity

Created for Bitcamp 2025 (https://bit.camp), CapitalClarity is a **Gemini AI-powered React Native app** designed to help users take control of their finances. By analyzing your spending history, the app delivers **real-time, personalized financial insights** that empower you to make smarter, budget-conscious decisions. Think of it as your **intelligent financial coach**, always learning and guiding you.

## Inspiration

Many people—especially students—struggle with managing personal finances. The issue isn’t always about income, but rather a lack of awareness and context around spending.

> “I check my bank app and just think… *where did all my money go?*”

In fact:
- **42% of college students carry credit card debt**, often unaware of how daily habits accumulate.
- Small, frequent purchases tend to slip under the radar, making budgeting difficult.
- Existing financial tools often feel disconnected or require too much manual input.

## Features

CapitalClarity is more than just a tracker — it’s your intelligent financial coach. Below are the key features that set it apart:

---

### 1. Transaction Analysis  
| What it does | Why it matters |
|--------------|----------------|
Users can upload CSV files containing their bank transaction history. These are processed using Google's Gemini AI to detect patterns, behaviors, and key spending markers — all within seconds.|It transforms raw financial data into structured insights without requiring users to manually categorize or analyze anything.|
---

### 2. Real-Time Financial Insights  

| What it does | Why it matters |
|--------------|----------------|
For each transaction, the app generates categorized insights categorized into **tips**, **achievements**, **warnings** | It transforms raw financial data into structured insights without requiring users to manually categorize or analyze anything.|Users receive instant, personalized feedback that helps them understand the *why* behind their spending habits.|

---

### 3. Interactive Feedback Loop  
| What it does | Why it matters |
|--------------|----------------|
Users can rate the **necessity** of individual transactions. This feedback is sent to the backend AI model to improve the accuracy of future suggestions. | The system becomes smarter over time, learning from real user intent — not just numbers.|


---

### 4. Personalized Spending Categories  
| What it does | Why it matters |
|--------------|----------------|
CapitalClarity automatically groups transactions into intuitive categories such as `Groceries, Meals & Dining, Travel, Entertainment, Subscriptions`. |This lets users track trends and identify problematic areas quickly without sorting through endless statements.

---

Together, these features help users move from reactive spending to proactive financial decision-making — all powered by AI and wrapped in a user-friendly experience.


# Setup

## Backend

The backend of CapitalClarity is built using Python and Flask, handling transaction analysis and AI integration.

**Requirements:** Python >= 3.10.

First, set up a virtual environment using:

``` bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

Run the Flask server:

``` bash
cd backend
pip install -r requirements.txt
python app.py
```

The server runs at http://localhost:5001. Adjust the port if necessary.

### Warning: This Flask server is designed for development purposes only and should not be used in a production environment.

<br>

## Frontend

The frontend is built with React Native (Expo).

Install dependencies:

```
cd frontend
npm install
```

Run the app:

```
npm start
```

Use Expo Go to view the app on your mobile device or emulator.
You should be able to load the app!