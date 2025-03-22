from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import filter, options, summary
from google import genai
import os
from dotenv import load_dotenv


load_dotenv()  # Load variables from .env into the environment

api_key = os.getenv("GEMINI_APIKEY")
client = genai.Client(api_key=api_key)


app = FastAPI()

@app.on_event("startup")
async def startup_event():
    app.state.ai_client = genai.Client(api_key=api_key)  # Created once

# Allow CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(filter.router)
app.include_router(options.router)
app.include_router(summary.router)