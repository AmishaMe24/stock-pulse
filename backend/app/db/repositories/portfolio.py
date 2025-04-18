from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio, Asset
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate, AssetCreate

def get_portfolios(db: Session, user_id: int) -> List[Portfolio]:
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

def get_portfolio(db: Session, portfolio_id: int, user_id: int) -> Optional[Portfolio]:
    return db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id).first()

def create_portfolio(db: Session, portfolio: PortfolioCreate, user_id: int) -> Portfolio:
    db_portfolio = Portfolio(name=portfolio.name, user_id=user_id)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def update_portfolio(db: Session, portfolio_id: int, portfolio: PortfolioUpdate, user_id: int) -> Optional[Portfolio]:
    db_portfolio = get_portfolio(db, portfolio_id, user_id)
    if db_portfolio:
        for key, value in portfolio.dict().items():
            setattr(db_portfolio, key, value)
        db.commit()
        db.refresh(db_portfolio)
    return db_portfolio

def delete_portfolio(db: Session, portfolio_id: int, user_id: int) -> bool:
    db_portfolio = get_portfolio(db, portfolio_id, user_id)
    if db_portfolio:
        db.delete(db_portfolio)
        db.commit()
        return True
    return False

def add_asset(db: Session, portfolio_id: int, asset: AssetCreate, user_id: int) -> Optional[Asset]:
    db_portfolio = get_portfolio(db, portfolio_id, user_id)
    if not db_portfolio:
        return None
    
    db_asset = Asset(
        portfolio_id=portfolio_id,
        symbol=asset.symbol,
        asset_type=asset.asset_type,
        quantity=asset.quantity,
        purchase_price=asset.purchase_price
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_asset(db: Session, asset_id: int, user_id: int) -> Optional[Asset]:
    return db.query(Asset).join(Portfolio).filter(
        Asset.id == asset_id,
        Portfolio.user_id == user_id
    ).first()

def update_asset(db: Session, asset_id: int, asset: AssetCreate, user_id: int) -> Optional[Asset]:
    db_asset = get_asset(db, asset_id, user_id)
    if db_asset:
        for key, value in asset.dict().items():
            setattr(db_asset, key, value)
        db.commit()
        db.refresh(db_asset)
    return db_asset

def delete_asset(db: Session, asset_id: int, user_id: int) -> bool:
    db_asset = get_asset(db, asset_id, user_id)
    if db_asset:
        db.delete(db_asset)
        db.commit()
        return True
    return False