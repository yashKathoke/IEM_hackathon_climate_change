from fastapi import APIRouter, Query
from database import get_unique_values, get_unique_countries_for_co2, get_cities_for_country

router = APIRouter()

@router.get("/temperature-filters")
def get_temperature_filters():
    """Fetch available countries for temperature filtering."""
    return get_unique_values()  # Returns {"countries": [...]}

@router.get("/cities-for-country")
def get_cities(country: str = Query(..., description="Country name")):
    """Fetch cities for the selected country."""
    return get_cities_for_country(country)  # Returns {"cities": [...]}

@router.get("/co2-filters")
def get_co2_filters():
    """Fetch available countries for CO₂ filtering."""
    return get_unique_countries_for_co2()  # Returns {"countries": [...]}
