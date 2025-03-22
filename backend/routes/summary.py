from fastapi import APIRouter, Query, Request
from ai_functions import generate_temperature_summary, generate_co2_summary

router = APIRouter()

@router.get("/temperature-summary")
async def temperature_summary(
    request: Request,
    country: str = Query(..., description="Country name"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)"),
    city: str = Query(None, description="City name (optional)"),
):
    """
    Generate a summary of temperature trends for the specified country and year range.
    Optionally, include a city for more specific data.
    """
    client = request.app.state.ai_client
    print(country, start_year, city)
    summary = generate_temperature_summary(client, country, start_year, end_year, city)
    print(summary)
    if "error" in summary.lower():  # Simple error check; adjust based on your AI functions
        return {"error": summary}
    return {"summary": summary}

@router.get("/co2-summary")
async def co2_summary(
    request: Request,
    country: str = Query(..., description="Country name"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)"),
):
    """
    Generate a summary of CO₂ emissions trends for the specified country and year range.
    """
    client = request.app.state.ai_client
    summary = generate_co2_summary(client, country, start_year, end_year)
    print(summary)
    if "error" in summary.lower():  # Simple error check; adjust based on your AI functions
        return {"error": summary}
    return {"summary": summary}