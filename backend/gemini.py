from google import genai
from pydantic import BaseModel

import enum
import time
import os
import ast


google_api_key = os.environ["GOOGLE_API_KEY"]
client = genai.Client(api_key=google_api_key)
chat = client.chats.create(model="gemini-2.0-flash")


class InsightClassification(enum.Enum):
    WARNING = "warning"
    TIP = "tip"
    ACHIEVEMENT = "achievement"


class GeneralInsights(BaseModel):
  title: str
  description: str
  type: InsightClassification

class CategoryInsightClassification(enum.Enum):
    GROCERIES = "groceries"
    TRAVEL = "travel"
    MEALS = "meals"
    ENTERTAINMENT = "entertainment"

class CategoricalInsights(BaseModel):
    type: CategoryInsightClassification
    points: list[str]

class CSVAnalysis(BaseModel):
    general : list[GeneralInsights]
    categorical : list[CategoricalInsights]


class PaymentClassification(BaseModel):
  necessarySpend: float
  reason: str
  alternatives: str


def analyzeCSV(filename):
    prompt =  """ 
    I have a CSV file containing transaction data with the following columns:
    - Date (format: YYYY-MM-DD)
    - Description (name/description of the merchant)
    - Amount (transaction amount in USD)
    - Category (e.g., Groceries, Dining, Entertainment, etc.)

    Please analyze this data and generate a detailed report of spending insights and categorical insights. 
    Spending insights are important notes about a user's spending habits. There are three types. Alerts: which are issues in the users spending habits, Tips: which are small changes but not that concerning, Achievements: which is progress that the user has made. 

    Here are three examples:
    title: 'Recurring Subscription Alert',
    description: 'You have 3 overlapping streaming subscriptions totaling $35/month. Consider reviewing Netflix, Hulu, and Disney+ subscriptions.',
    type: 'warning',

    title: 'Smart Shopping Opportunity',
    description: 'Your grocery spending peaks on weekends. Shopping on Wednesday evenings could save you ~15 percent based on historical prices.',
    type: 'tip',

    title: 'Savings Milestone',
    description: "Great job! You've reduced dining out expenses by 20 percent compared to last month.",
    type: 'achievement',

    Your output should be eactly one achievement, one tip, and one warning.

    Along with that, you should provide some categorical insights that provide a more high-level insight about specific category expenses. These are normally of the form of the category, which can be Groceries, Travel, Meals (Food & Drink), Entertainment. 
    Here are some examples of categorical insights:
    
    category: 'Food',
    points: [
    'Grocery spending is 15 percent higher than similar households',
    'Most expensive shopping day: Saturdays',
    "Frequent stores: Whole Foods (65%), Trader Joe's (25%)",
    ],

    category: 'Entertainment',
    points: [
        'Subscription overlap detected',
        'Peak entertainment spending: Weekends',
        'Digital vs Physical: 80p percent digital purchases',
      ],

    category: 'Transport'
    points: [
        'Public transit could save $150/month',
        'Peak ride-share times: Friday nights',
        'Consider carpooling options',
      ],
    
    category: 'Housing',
    points: [
        'Utilities 20 percent above average',
        'Consider energy-efficient upgrades',
        'Rent is within market range',
      ]

    Provide some categorical insights, but each one must be brand new. 

    """

    csv_file = client.files.upload(file=filename)

    print("Making LLM inference request...")
    # Set the model to Gemini Flash and Make the LLM request
    response : PaymentClassification = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[csv_file, prompt],
    config={
        'response_mime_type': 'application/json',
        'response_schema': CSVAnalysis,
        }
    ).parsed

    client.files.delete(name=csv_file.name)
    text = response.model_dump_json()

    return ast.literal_eval(text)

def initChat(filename):
    csv_file = client.files.upload(file=filename)

    prompt = """ 
    I have a CSV file containing transaction data with the following columns:
    - Date (format: YYYY-MM-DD)
    - Vendor (name/description of the merchant)
    - Amount (transaction amount in USD)
    - Category (e.g., Groceries, Dining, Entertainment, etc.)

    Please analyze this data and generate a detailed report that includes

    **Actionable Recommendations** for how users can adjust their spending habits to shop smarter. For instance, if a certain category shows excessive spending, suggest cost-saving alternatives or tips to curb that expense.

    Please make your analysis as detailed and comprehensive as possible, explaining complex insights step by step and providing numerical details wherever available. Format your output in clearly segmented sections (Overview, Temporal Analysis, Category Analysis, Vendor Analysis, and Recommendations).

    """

    chat.send_message([csv_file, prompt])

def newTransaction(info):
    new_prompt = f"""
        There was a brand new expenditure, labeled as:

        Description: {info["description"]}
        Category: {info["category"]}
        Amount: {info["amount"]}

        Based on the previous recent spending, can you analyze how necessary this was.

        necessarySpend, a float from 0 to 1 about how necessary it was with 1 being the most necessary
        reason: In an informative but polite style, rather than conversation, explain why you made this decision, briefly.
        alternatives: An alternative that could save users money
    """
    
    print("Sent LLM Message...")
    response : PaymentClassification = chat.send_message(new_prompt, 
        config={
            'response_mime_type': 'application/json',
            'response_schema': PaymentClassification
        }).parsed
    print(response)


    return {"necessarySpend" : float(response.necessarySpend), "reason" : response.reason, "alternatives" : response.alternatives}


