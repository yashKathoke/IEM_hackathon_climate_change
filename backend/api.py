from google import genai
import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env into the environment

api_key = os.getenv("GEMINI_APIKEY")
client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Explain how AI works in a few words"
)
print(response.text)