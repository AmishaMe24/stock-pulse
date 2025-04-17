# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.portfolio import Portfolio, Asset, Alert