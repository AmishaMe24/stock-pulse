# Stock Pulse

![Stock Pulse Dashboard](./docs/images/dashboard.png)

A full-stack investment portfolio tracking application that allows users to manage their stock portfolios, track asset performance, and receive real-time price alerts.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Portfolio Management**: Create, update, and delete investment portfolios
- **Asset Tracking**: Add stocks and other assets to portfolios with purchase details
- **Real-time Price Updates**: Get live stock price data via Alpha Vantage API
- **Price Alerts**: Set custom price alerts for your assets
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- JWT for authentication

### Backend
- FastAPI (Python)
- PostgreSQL for data persistence
- Redis for caching and session management
- Kafka with Zookeeper for real-time data streaming
- JWT for authentication
- SQLAlchemy for ORM

## Architecture

![Architecture Diagram](./docs/images/architecture.png)

### Architectural Decisions

1. **Microservices Approach**: The application is built using a microservices architecture to allow for better scalability and separation of concerns.

2. **Real-time Data Processing**: Kafka was chosen for real-time price updates due to its high throughput and reliability for streaming data.

3. **Caching Strategy**: Redis is used for caching frequently accessed data like stock prices to reduce API calls and improve performance.

4. **JWT Authentication**: JSON Web Tokens provide a stateless authentication mechanism that works well with the microservices architecture.

5. **PostgreSQL**: Chosen for its robustness in handling relational data and transaction support, which is critical for financial data.

## Screenshots

### Login Page
![Login Page](./docs/images/login.png)

### Portfolio Overview
![Portfolio Overview](./docs/images/portfolios.png)

### Asset Details
![Asset Details](./docs/images/asset-details.png)

### Price Alerts
![Price Alerts](./docs/images/alerts.png)

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.9+)
- PostgreSQL
- Docker (for Kafka and Zookeeper)
- Redis

### Installation

#### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/stock-pulse.git
   cd stock-pulse/backend
   ```

5. Set up the database
   ```bash
   # Connect to PostgreSQL and create the database
   psql -U postgres
   CREATE DATABASE stockpulse;
   \q
   
   # Run the database initialization script
   python -m app.db.init_db
   ```