from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import atexit
from app.db.session import engine, Base
from app.api import auth, portfolio, alert, stock, price_stream
from app.services.service_manager import service_manager

# Import all models to ensure they're registered with SQLAlchemy
from app.models import user, portfolio as portfolio_models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stock Pulse API", description="Real-Time Portfolio Alert System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(portfolio.router, prefix="/api/portfolios", tags=["portfolios"])
app.include_router(alert.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(stock.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(price_stream.router, prefix="/api/price-stream", tags=["price-stream"])

@app.get("/")
async def root():
    return {"message": "Welcome to Stock Pulse API"}

@app.on_event("startup")
async def startup_event():
    """Start background services when the application starts"""
    service_manager.start_services()

@app.on_event("shutdown")
async def shutdown_event():
    """Stop background services when the application shuts down"""
    service_manager.stop_services()

# Register shutdown handler
atexit.register(service_manager.stop_services)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)