from google import genai
import os
from dotenv import load_dotenv
from database import filter_temperature_data

load_dotenv()  # Load variables from .env into the environment

api_key = os.getenv("GEMINI_APIKEY")
client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Explain how AI works in a few words"
)
print(response.text)

# def filter_temperature_data(country: str, start_year: int, end_year: int):
#     """Filter data based on country and year range."""
#     filtered_df = df[(df["Country"] == country) & (df["year"] >= start_year) & (df["year"] <= end_year)]
#     result = filtered_df.groupby("year")["AverageTemperature"].mean().reset_index()
#     result = result.rename(columns={"year": "year", "AverageTemperature": "temperature"})
#     return result.to_dict(orient="records")

# genai.configure(api_key=api_key)

def generate_summary(data):
    """Generate a summary using Gemini AI based on the provided temperature data."""
    prompt = f"""
    Summarize the climate trend from the following data:
    {data}
    Provide key insights on temperature changes over the years in a concise manner.
    """
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return response.text

if __name__ == "__main__":
    # User Input
    country = input("Enter the country: ")
    start_year = int(input("Enter the start year: "))
    end_year = int(input("Enter the end year: "))
    
    # Filter Data
    filtered_data = filter_temperature_data(country, start_year,end_year )
    
    if not filtered_data:
        print("No data found for the given input.")
    else:
        # Generate Summary
        summary = generate_summary(filtered_data)
        print("\nAI-Generated Summary:")
        print(summary)