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
  smartSpend: float
  reason: str


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

    Recognize the spending patterns within the transaction history, especially how expenditures with categories work.
    Determine how to tell if a purchase is smart or not, where smartness is defined by the tradeoff between the money spent and cheaper alternatives. The goal is detect addictive spending habits, and curb consumerism in real time. 
    """

    return chat.send_message([csv_file, prompt]).text

def newTransaction(info):
    new_prompt = f"""
        There was a brand new expenditure, labeled as:
        
        Description: {info["description"]}
        Category: {info["category"]}
        Amount: {info["amount"]}

        Based on the previous spending, can you analyze how necessary this was, where we define necessary as how important of a purchase it normally is, whether cheaper alternatives are minimal extra work, and past expenditures support that this is not necessary expenditure.

        smartSpend, a float from 0 to 1 representing how confident you are in your answer that this is financially smart
        reason: In an informative but polite style, rather than conversation, explain why you made this decision, briefly. 

        Here are a couple examples:
        Input: Tamarind Indian Restaurant, Food & Dining Category, $52.00
        Output: smartSpend : 0.35, reason: While eating out isn't necessarily bad financially, continuing this pattern can become an issue. Consider cooking meals at home or meal prepping!

        Input: UMD Dining Hall, Food & Dining Category, $8.00
        Output: smartSpend: 0.6, reason: This is a relatively cheap meal, saving time at home. However, bringing packed meals to university can be incredibly financiall beneficial. 

        Input: Aldi's, Groceries, $81.00
        Output: smartSpend: 0.85, reason: Aldi's is a historicaly cheap grocery outlet, and good job on practicing smart financial sense!
    """
    
    print("Sent LLM Message...")
    response : PaymentClassification = chat.send_message(new_prompt, 
        config={
            'response_mime_type': 'application/json',
            'response_schema': PaymentClassification
        }).parsed
    print(response)


    return {"smartSpend" : float(response.smartSpend), "reason" : response.reason}

def transitionFeedback(info):
    necessaryText = ()
    prompt = f"""
        The previous expenditure described by:

        Description: {info["description"]}
        Category: {info["category"]}
        Amount: {info["amount"]}

        actually turned out to be: {"necessary" if bool(info["necessary"]) else "unnecessary"}

        The reasoning provided by the user was: {info["reason"]}

        You should use this information for later transactions, learning how things are classified.
    """

    print("Sent LLM Correction Message...")
    response = chat.send_message(prompt)
    print(response.text)

