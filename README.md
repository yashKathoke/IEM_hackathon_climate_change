# IEM Hackathon Charts

This project is a web application that visualizes CO2 and temperature data using React, Vite, and FastAPI.

## Project Structure

- **frontend**: Contains the React frontend application.
- **backend**: Contains the FastAPI backend application.

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package installer)

## Setup
### Clone the project
```sh
git clone https://github.com/yashKathoke/IEM_hackathon_climate_change.git
cd IEM_hackathon_climate_change
```
### Backend

1. Navigate to the backend directory:

    ```sh
    cd backend
    ```

2. Create a virtual environment:

    ```sh
    python -m venv venv
    ```

3. Activate the virtual environment:

    - On Windows:

        ```sh
        .\venv\Scripts\activate
        ```

    - On macOS/Linux:

        ```sh
        source venv/bin/activate
        ```

4. Install the required packages:

    ```sh
    pip install -r requirements.txt
    ```

5. Create a `.env` file in the backend directory and add your API key:

    ```env
    GEMINI_APIKEY=your_api_key_here
    ```
    ## Get api key here:: https://aistudio.google.com/prompts/new_chat



6. Run the FastAPI server:

    ```sh
    uvicorn main:app --reload
    ```

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd frontend
    ```

2. Install the required packages:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm run dev
    ```

## Running the Project

1. Ensure the backend server is running.
2. Ensure the frontend development server is running.
3. Open your browser and navigate to `http://localhost:3000` to view the application.
