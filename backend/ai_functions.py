import pandas as pd
from sklearn.linear_model import LinearRegression
from database import filter_temperature_data, filter_co2_data


def generate_temperature_summary(client, country, start_year, end_year, city=None):
    # Fetch filtered temperature data
    temp_data = filter_temperature_data(country, start_year, end_year, city)
    # print(temp_data)
    if not temp_data:
        return "No temperature data available for the specified parameters."
    
    # Convert to DataFrame for processing
    temp_df = pd.DataFrame(temp_data)
    
    # Calculate temperature statistics
    avg_temp = temp_df['temperature'].mean()
    min_temp = temp_df['temperature'].min()
    max_temp = temp_df['temperature'].max()
    
    # Compute temperature trend using linear regression
    X = temp_df['year'].values.reshape(-1, 1)
    y = temp_df['temperature'].values
    model = LinearRegression().fit(X, y)
    temp_trend = model.coef_[0]  # Slope in °C per year
    
    # Set location string based on whether city is provided
    location = f"{city}, {country}" if city else country
    
    # Create prompt for Gemini AI
    prompt = f"""
    Analyze the temperature data for {location} from {start_year} to {end_year}.
    The average temperature was {avg_temp:.2f}°C, with a minimum of {min_temp:.2f}°C and a maximum of {max_temp:.2f}°C.
    The trend shows a change of {temp_trend:.2f}°C per year.
    Provide a concise summary of the temperature trend in 3-5 sentences.
    """
    
    # Generate summary with Gemini AI
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating temperature summary: {str(e)}"



def generate_co2_summary(client, country, start_year, end_year):

    # Fetch filtered CO₂ data
    co2_data = filter_co2_data(country, start_year, end_year)
    if not co2_data:
        return "No CO₂ data available for the specified parameters."
    
    # Convert to DataFrame for processing
    co2_df = pd.DataFrame(co2_data)
    
    # Calculate CO₂ statistics
    total_co2 = co2_df['co2_emissions'].sum()
    avg_co2 = co2_df['co2_emissions'].mean()
    
    # Compute CO₂ trend using linear regression
    X = co2_df['year'].values.reshape(-1, 1)
    y = co2_df['co2_emissions'].values
    model = LinearRegression().fit(X, y)
    co2_trend = model.coef_[0]  # Slope in metric tons per year
    
    # Determine trend direction
    trend_direction = "increasing" if co2_trend > 0 else "decreasing"
    
    # Create prompt for Gemini AI
    prompt = f"""
    Analyze the CO₂ emissions data for {country} from {start_year} to {end_year}.
    The total CO₂ emissions were {total_co2:.2f} metric tons, with an average annual emission of {avg_co2:.2f} metric tons.
    The trend shows a change of {co2_trend:.2f} metric tons per year, indicating {trend_direction} emissions.
    Provide a concise summary of the CO₂ emissions trend in 3-5 sentences.
    """
    
    # Generate summary with Gemini AI
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating CO₂ summary: {str(e)}"


# temp_summary = generate_temperature_summary(client, "India", 2000, 2020)
# print("Temperature Summary:")
# print(temp_summary)

# # Get CO₂ summary for USA from 2000 to 2020
# co2_summary = generate_co2_summary(client, "India", 2000, 2020)
# print("CO₂ Summary:")
# print(co2_summary)