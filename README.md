# RouteGuard AI — Smart Logistics & Risk-Aware Route Intelligence

RouteGuard AI is a logistics intelligence platform designed to help users analyze road routes and, as the project evolves, assess potential route-disruption risks.

The platform currently integrates a Flask backend with a web-based frontend to retrieve road routes, calculate estimated travel distance and duration, and display the route on an interactive map.

## Current Features

- **Route analysis:** Accepts origin and destination locations.
- **Road routing:** Uses OpenStreetMap-based geocoding and OSRM routing services.
- **Interactive map:** Displays the calculated route using Leaflet.
- **Route metrics:** Shows road distance and estimated driving duration.
- **Frontend–backend integration:** Connects the web interface to a Flask REST API.

> **Current status:** Route calculation is implemented. ML-based risk prediction, live weather integration, and incident-based risk assessment are not yet implemented.

## Project Structure

```text
RouteGuard/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── ml/
│   ├── data/
│   ├── models/
│   ├── notebooks/
│   └── src/
├── .gitignore
└── README.md
```

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript, Leaflet
- **Backend:** Python, Flask, Flask-CORS
- **Geocoding:** OpenStreetMap Nominatim
- **Road routing:** OSRM
- **Version control:** Git and GitHub
- **Machine learning:** Planned risk prediction pipeline

## Getting Started

### Prerequisites

- Python 3
- Git
- A modern web browser
- Internet access for external geocoding, routing, and map services

### 1. Clone the repository

```bash
git clone https://github.com/SahilIlyasi/RouteGuard.git
cd RouteGuard
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the backend:

```bash
python run.py
```

The Flask development server runs at `http://127.0.0.1:5000`.

### 3. Start the frontend

Open a **second terminal** from the repository root:

```bash
py -m http.server 5500 --directory frontend
```

Open `http://127.0.0.1:5500` in your browser.

Keep both servers running while testing the application.

## API Endpoints

### Health check

`GET /api/health`

Checks whether the backend is responding.

### Analyze route

`POST /api/routes/analyze`

Example request:

```json
{
  "origin": "Bhopal",
  "destination": "Indore"
}
```

The route endpoint returns route information, including distance, estimated duration, and route geometry, when the request succeeds.

## Roadmap

- [x] Flask backend setup
- [x] Frontend and backend integration
- [x] Real road-route calculation
- [x] Interactive route visualization
- [ ] Automated backend tests
- [ ] ML-based route risk scoring
- [ ] Weather and road-condition integration
- [ ] Historical incident analysis
- [ ] Production deployment

## External Services

RouteGuard currently depends on OpenStreetMap Nominatim for geocoding and the OSRM routing service for road-route calculations. These are external services, so availability and usage policies apply.

## Disclaimer

RouteGuard is under active development. Current route results provide routing information only and should not be interpreted as an AI-generated safety or risk assessment.

## Team

Developed collaboratively as a smart logistics and route-intelligence project.
