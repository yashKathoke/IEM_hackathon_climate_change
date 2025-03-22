import pandas as pd

# Load temperature dataset
df_temp = pd.read_csv("temparature_data.csv", parse_dates=["dt"])
df_temp["year"] = df_temp["dt"].dt.year  # Extract year column

# Load CO₂ dataset
df_co2 = pd.read_csv("co2_data.csv")

def get_unique_values():
    unique_countries = df_temp["Country"].dropna().unique().tolist()
    return {"countries": unique_countries}

def get_unique_countries_for_co2():
    unique_countries = df_co2["Country"].dropna().unique().tolist()
    return {"countries": unique_countries}

def get_cities_for_country(country: str):
    unique_cities = df_temp[df_temp["Country"] == country]["State"].dropna().unique().tolist()
    return {"cities": unique_cities}

# Existing filtering functions (already updated for multi-country support)
def filter_temperature_data_multi(countries: list, start_year: int, end_year: int, city: str = ""):
    filtered_df = df_temp[
        df_temp["Country"].isin(countries) &
        (df_temp["year"] >= start_year) &
        (df_temp["year"] <= end_year)
    ]
    if city and len(countries) == 1:
        filtered_df = filtered_df[filtered_df["State"] == city]
    result = filtered_df.groupby(["Country", "year"])["AverageTemperature"].mean().reset_index()
    result = result.rename(columns={"year": "year", "AverageTemperature": "temperature"})
    return result.to_dict(orient="records")

def filter_co2_data(countries: list, start_year: int, end_year: int):
    filtered_df = df_co2[
        df_co2["Country"].isin(countries) &
        (df_co2["Year"] >= start_year) &
        (df_co2["Year"] <= end_year)
    ]
    result = filtered_df.groupby(["Country", "Year"])["Annual_CO2_Emissions"].sum().reset_index()
    result = result.rename(columns={"Year": "year", "Annual_CO2_Emissions": "co2_emissions"})
    return result.to_dict(orient="records")
