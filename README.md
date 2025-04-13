# CapitalClarity

Created for Bitcamp 2025 (https://bit.camp), CapitalClarity is an innovative React Native application designed to help users improve their financial habits by leveraging artificial intelligence. With the growing complexity of managing personal finances and maintaining disciplined spending, we recognized the need for a tool that not only tracks transactions but also proactively guides users toward better financial decisions. CapitalClarity provides real-time personalized insights, tips, warnings, and achievements based on the user's transaction history.

## Inspiration

Our motivation for CapitalClarity arose from the observation that many individuals struggle to keep their finances under control, often due to a lack of real-time feedback and actionable insights. We aimed to bridge this gap by developing an app capable of analyzing financial data and providing immediate, tailored advice to foster healthier spending habits.

## Features

- Transaction Analysis: Users upload CSV files containing their transaction histories, which are immediately analyzed using Google's Gemini AI.

- Real-Time Financial Insights: The app generates actionable insights categorized as warnings, tips, or achievements, helping users quickly understand their financial behaviors.

- Interactive Feedback Loop: Users can rate the necessity of each transaction, providing the AI with valuable feedback to refine future suggestions.

- Personalized Categories: The app categorizes expenditures into intuitive groups such as groceries, meals, travel, and entertainment, each with specific budgeting insights.

# Setup

## Backend

The backend of CapitalClarity is built using Python and Flask, handling transaction analysis and AI integration.

**Requirements:** Python >= 3.10.

First, set up a virtual environment using:

```
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

Run the Flask server:

```
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