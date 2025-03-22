from fastapi import APIRouter, Query, Request
from typing import List
from ai_functions import generate_temperature_summary, generate_co2_summary

router = APIRouter()



@router.get("/temperature-summary")
async def temperature_summary(
    request: Request,
    countries: List[str] = Query(..., alias="country", description="Comma-separated list of country names"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)"),
    city: str = Query(None, description="City name (optional, only applies if a single country is provided)")
):
    client = request.app.state.ai_client
    # print("this is summary"+ countries)
    # If multiple countries are provided, ignore the city parameter
    if len(countries) == 1 and "," in countries[0]:
        countries = [c.strip() for c in countries[0].split(",")]
    if len(countries) > 1:
        city = ""
    print("Temperature Summary Request:", countries, start_year, city)
    summary = generate_temperature_summary(client, countries, start_year, end_year, city)
    print("Temperature Summary:", summary)
    if "error" in summary.lower():
        return {"error": summary}
    return {"summary": summary}





@router.get("/co2-summary")
async def co2_summary(
    request: Request,
    countries: List[str] = Query(..., alias="country", description="Comma-separated list of country names"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)")
):
    if len(countries) == 1 and "," in countries[0]:
        countries = [c.strip() for c in countries[0].split(",")]
    client = request.app.state.ai_client
    print("CO₂ Summary Request:", countries, start_year, end_year)
    summary = generate_co2_summary(client, countries, start_year, end_year)
    print("CO₂ Summary:", summary)
    if "error" in summary.lower():
        return {"error": summary}
    return {"summary": summary}
