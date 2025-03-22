import pandas as pd

# Load temperature dataset
df_temp = pd.read_csv("temparature_data.csv", parse_dates=["dt"])
df_temp["year"] = df_temp["dt"].dt.year  # Extract year column

# Load CO₂ dataset
df_co2 = pd.read_csv("co2_data.csv")

def get_unique_values():
    """Extract unique country names and all available cities."""
    unique_countries = df_temp["Country"].dropna().unique().tolist()
    return {"countries": unique_countries}

def get_cities_for_country(country: str):
    """Get cities for a selected country."""
    unique_cities = df_temp[df_temp["Country"] == country]["State"].dropna().unique().tolist()
    return {"cities": unique_cities}

def get_unique_countries_for_co2():
    """Extract unique country names from CO₂ dataset."""
    unique_countries = df_co2["Country"].dropna().unique().tolist()
    return {"countries": unique_countries}

def filter_temperature_data(country: str, start_year: int, end_year: int, city: str=""):
    """Filter temperature data based on country, optional city, and year range."""
    filtered_df = df_temp[
        (df_temp["Country"] == country) &
        (df_temp["year"] >= start_year) & 
        (df_temp["year"] <= end_year)
    ]

    if city:
        filtered_df = filtered_df[filtered_df["State"] == city]

    result = filtered_df.groupby("year")["AverageTemperature"].mean().reset_index()
    result = result.rename(columns={"year": "year", "AverageTemperature": "temperature"})
    return result.to_dict(orient="records")

def filter_co2_data(country: str, start_year: int, end_year: int):
    """Filter CO₂ data based on country and year range."""
    filtered_df = df_co2[
        (df_co2["Country"] == country) & 
        (df_co2["Year"] >= start_year) & 
        (df_co2["Year"] <= end_year)
    ]
    result = filtered_df.groupby("Year")["Annual_CO2_Emissions"].sum().reset_index()
    result = result.rename(columns={"Year": "year", "Annual_CO2_Emissions": "co2_emissions"})
    return result.to_dict(orient="records")
