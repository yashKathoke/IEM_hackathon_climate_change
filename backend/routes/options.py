from fastapi import APIRouter
from database import (
    # Assume you have functions for options
    get_unique_values, 
    get_unique_countries_for_co2, 
    get_cities_for_country
)

router = APIRouter()

@router.get("/temperature-filters")
def get_temperature_filters():
    # Returns available countries (for temperature)
    return get_unique_values()

@router.get("/co2-filters")
def get_co2_filters():
    # Returns available countries (for CO₂)
    return get_unique_countries_for_co2()

@router.get("/cities-for-country")
def get_cities(country: str):
    # Returns cities for a given country from the temperature data
    return get_cities_for_country(country)
