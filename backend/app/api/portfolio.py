from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.portfolio import Portfolio, PortfolioCreate, PortfolioUpdate, Asset, AssetCreate
from app.db.repositories.portfolio import (
    get_portfolios, get_portfolio, create_portfolio, update_portfolio, delete_portfolio,
    add_asset, get_asset, update_asset, delete_asset
)
from app.services.price_stream import price_stream_producer

router = APIRouter()

@router.get("/", response_model=List[Portfolio])
def read_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all portfolios for the current user.
    """
    portfolios = get_portfolios(db, current_user.id)
    return portfolios

@router.post("/", response_model=Portfolio, status_code=status.HTTP_201_CREATED)
def create_new_portfolio(
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new portfolio for the current user.
    """
    return create_portfolio(db, portfolio, current_user.id)

@router.get("/{portfolio_id}", response_model=Portfolio)
def read_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific portfolio by ID.
    """
    portfolio = get_portfolio(db, portfolio_id, current_user.id)
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.put("/{portfolio_id}", response_model=Portfolio)
def update_portfolio_endpoint(
    portfolio_id: int,
    portfolio_data: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a portfolio.
    """
    portfolio = update_portfolio(db, portfolio_id, portfolio_data, current_user.id)
    if portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_endpoint(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a portfolio.
    """
    success = delete_portfolio(db, portfolio_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"detail": "Portfolio deleted successfully"}

# Asset endpoints
@router.post("/{portfolio_id}/assets", response_model=Asset, status_code=status.HTTP_201_CREATED)
def add_asset_to_portfolio(
    portfolio_id: int,
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add an asset to a portfolio.
    """
    db_asset = add_asset(db, portfolio_id, asset, current_user.id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Automatically start tracking this symbol
    price_stream_producer.add_symbol(asset.symbol)
    
    return db_asset

@router.put("/assets/{asset_id}", response_model=Asset)
def update_asset_endpoint(
    asset_id: int,
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an asset.
    """
    asset = update_asset(db, asset_id, asset_data, current_user.id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset_endpoint(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an asset.
    """
    success = delete_asset(db, asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"detail": "Asset deleted successfully"}