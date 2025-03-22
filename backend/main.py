from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import filter, options

app = FastAPI()

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
