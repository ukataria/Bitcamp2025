from google import genai
from pydantic import BaseModel

import time
import os


google_api_key = os.environ["GOOGLE_API_KEY"]
client = genai.Client(api_key=google_api_key)
chat = client.chats.create(model="gemini-2.0-flash")

class ActionableReccomendations(BaseModel):
  groupTitle: str
  reason: str
  actions: list[str]

class PaymentClassification(BaseModel):
  necessarySpend: float
  reason: str
  alternatives: str


# Returns a jsonified gemini output to the video analysis, where we provide the filename within videos
def responseToJSON(response):
    actions: list[ActionableReccomendations] = response.parsed
    reccomendations = []

    for action in actions:
        reccomendations.append({"Title" : action.groupTitle, "Reason": action.reason, "Actions": action.actions})
    return reccomendations

def analyzeCSV(filename):
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

    csv_file = client.files.upload(file=filename)

    print("Making LLM inference request...")
    # Set the model to Gemini Flash and Make the LLM request
    response = client.models.generate_content(
    model="gemini-2.5-pro-exp-03-25",
    contents=[csv_file, prompt],
    config={
        'response_mime_type': 'application/json',
        'response_schema': list[ActionableReccomendations],
        }
    )

    client.files.delete(name=csv_file.name)

    return responseToJSON(response)

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


