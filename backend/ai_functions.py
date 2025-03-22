import pandas as pd
from sklearn.linear_model import LinearRegression
from database import filter_temperature_data_multi, filter_co2_data

def generate_temperature_summary(client, countries, start_year, end_year, city=""):
    # Fetch filtered temperature data for multiple countries
    temp_data = filter_temperature_data_multi(countries, start_year, end_year, city)
    if not temp_data:
        return "No temperature data available for the specified parameters."
    
    # Convert to DataFrame for processing
    temp_df = pd.DataFrame(temp_data)
    
    summary_parts = []
    # Process data for each country
    for country in countries:
        country_df = temp_df[temp_df["Country"] == country]
        if country_df.empty:
            continue
        avg_temp = country_df['temperature'].mean()
        min_temp = country_df['temperature'].min()
        max_temp = country_df['temperature'].max()
        
        # Compute temperature trend using linear regression
        X = country_df['year'].values.reshape(-1, 1)
        y = country_df['temperature'].values
        if len(X) > 1:
            model = LinearRegression().fit(X, y)
            temp_trend = model.coef_[0]  # Slope in °C per year
        else:
            temp_trend = 0
        
        summary_parts.append(
            f"For {country}, from {start_year} to {end_year}, the average temperature was {avg_temp:.2f}°C "
            f"(min: {min_temp:.2f}°C, max: {max_temp:.2f}°C) with a trend of {temp_trend:.2f}°C per year."
        )
    
    if not summary_parts:
        return "No temperature data available for the specified parameters."
    
    # Build a prompt for comparative analysis
    prompt = (
        f"Compare the temperature trends for the following countries or if only one country data is availabe then provide analysis of only one country: {', '.join(countries)} over the period "
        f"{start_year} to {end_year}. " + " ".join(summary_parts) +
        " Provide a concise comparative analysis in 3-5 sentences."
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating temperature summary: {str(e)}"


def generate_co2_summary(client, countries, start_year, end_year):
    # Fetch filtered CO₂ data for multiple countries
    co2_data = filter_co2_data(countries, start_year, end_year)
    if not co2_data:
        return "No CO₂ data available for the specified parameters."
    
    # Convert to DataFrame for processing
    co2_df = pd.DataFrame(co2_data)
    
    summary_parts = []
    # Process data for each country
    for country in countries:
        country_df = co2_df[co2_df["Country"] == country]
        if country_df.empty:
            continue
        total_co2 = country_df['co2_emissions'].sum()
        avg_co2 = country_df['co2_emissions'].mean()
        
        # Compute CO₂ trend using linear regression
        X = country_df['year'].values.reshape(-1, 1)
        y = country_df['co2_emissions'].values
        if len(X) > 1:
            model = LinearRegression().fit(X, y)
            co2_trend = model.coef_[0]
        else:
            co2_trend = 0
        
        trend_direction = "increasing" if co2_trend > 0 else "decreasing"
        summary_parts.append(
            f"For {country}, total emissions were {total_co2:.2f} metric tons, with an average of {avg_co2:.2f} metric tons per year. "
            f"The trend shows a change of {co2_trend:.2f} metric tons per year, indicating {trend_direction} emissions."
        )
    
    if not summary_parts:
        return "No CO₂ data available for the specified parameters."
    
    prompt = (
        f"Compare the CO₂ emissions trends for the following countries: {', '.join(countries)} over the period {start_year} to {end_year}. "
        + " ".join(summary_parts) +
        " Provide a concise comparative analysis in 3-5 sentences."
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating CO₂ summary: {str(e)}"
