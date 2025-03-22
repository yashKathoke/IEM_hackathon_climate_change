import pandas as pd

def get_unique_values_from_csv(file_path):
    try:
        df = pd.read_csv(file_path)

        if 'Country' not in df.columns:
          raise ValueError("Column 'Country' not found in the CSV.")

        if 'State' not in df.columns:
          raise ValueError("Column 'State' not found in the CSV.")

        unique_Country = df['Country'].unique().tolist()
        unique_cities = df['State'].unique().tolist()

        return unique_Country, unique_cities

    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return [], [] # Return empty lists in case of an error
    except ValueError as e:
        print(f"Error: {e}")
        return [],[]
    except Exception as e:
        print(f"An unexpected error occurred:{e}")
        return [],[]


file_path = 'temparature_data.csv'  # Replace with the actual path to your CSV file
Country, cities = get_unique_values_from_csv(file_path)

if Country and cities: # check if the lists are not empty, meaning no errors occured.
    print("Unique Country:", Country)
    print("Unique Cities:", cities)