from google import genai
from pydantic import BaseModel

import time
import os


google_api_key = os.environ["GOOGLE_API_KEY"]
client = genai.Client(api_key=google_api_key)

class Alert(BaseModel):
  description: str
  shouldAlert: bool

# Returns a jsonified gemini output to the video analysis, where we provide the filename within videos
def analyzeVideo(filename, client):
   

    print("Uploading file...")
    video_folder = os.environ["VIDEOPATH"]
    video_file = client.files.upload(file=video_folder + filename)
    print(f"Completed upload: {video_file.uri}")

    # Check whether the file is ready to be used.
    while video_file.state.name == "PROCESSING":
        video_file = client.files.get(name=video_file.name)

    if video_file.state.name == "FAILED":
        raise ValueError(video_file.state.name)

    print('Ready to use vidoe')

    # Create the prompt.
    prompt = """Describe this video. 
    
    Return a JSON object in this exact format:

{
    "description": "Extensive description of what's happening in this video chunk",
    "isAlert": true/false // Set to true if there is an instance of, robbery, snooping, or different unwanted behaviour
}
    
    """

    print("Making LLM inference request...")
    # Set the model to Gemini Flash and Make the LLM request
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[video_file, prompt],
        config={
            'response_mime_type': 'application/json',
            'response_schema': list[Alert],
        },
    )
    print(response.text)



    response = analyzeVideo("wave.mp4", client=client)
    alert: list[Alert] = response.parsed
    print(alert[0])
    print(alert[0].description)

    client.files.delete(name=video_file.name)
    print(f'Deleted file {video_file.uri}')

    return alert
