from fastapi import FastAPI, Query
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Allow CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load CSV once for performance
df = pd.read_csv("temparature_data.csv", parse_dates=["dt"])

# Extract the year as a new column
df["year"] = df["dt"].dt.year

@app.get("/filter")
def filter_data(
    country: str = Query(..., description="Country name"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)")
):
    # Filter data based on country and year range
    filtered_df = df[
        (df["Country"] == country) &
        (df["year"] >= start_year) &
        (df["year"] <= end_year)
    ]

    # Prepare data for frontend (convert to JSON)
    result = filtered_df.groupby("year")["AverageTemperature"].mean().reset_index()
    result = result.rename(columns={"year": "year", "AverageTemperature": "temperature"})

    return result.to_dict(orient="records")

# Run with: uvicorn main:app --reload
