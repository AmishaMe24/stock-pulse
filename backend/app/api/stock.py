from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.stock_service import stock_service
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/search", response_model=List[Dict[str, Any]])
def search_stocks(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search for stocks by company name or symbol.
    """
    results = stock_service.search_symbol(query)
    return results

@router.get("/quote/{symbol}")
def get_stock_quote(
    symbol: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the latest price for a stock.
    """
    quote = stock_service.get_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
    return quote

@router.get("/daily/{symbol}")
def get_daily_prices(
    symbol: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get daily time series for a stock.
    """
    data = stock_service.get_daily_prices(symbol)
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
    return data