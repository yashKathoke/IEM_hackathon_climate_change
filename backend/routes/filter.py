from fastapi import APIRouter, Query
from database import filter_temperature_data, filter_co2_data

router = APIRouter()

@router.get("/filter")
def filter_data(
    dataset: str = Query(..., description="Choose dataset: 'temperature' or 'co2'"),
    country: str = Query(..., description="Country name"),
    city: str = Query(None, description="City name (only for temperature)"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)"),
):
    if dataset == "temperature":
        if not city:
            city = ""
            # return {"error": "City is required for temperature filtering"}
        return filter_temperature_data(country, city, start_year, end_year)
    
    elif dataset == "co2":
        return filter_co2_data(country, start_year, end_year)

    return {"error": "Invalid dataset. Choose 'temperature' or 'co2'"}
