from sqlalchemy.orm import Session

from app.db.session import engine, Base
from app.models import user, portfolio

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized")