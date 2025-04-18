from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.price_stream import price_stream_producer

router = APIRouter()

@router.post("/track")
def track_symbol(
    symbol: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a symbol to the price stream tracking.
    """
    price_stream_producer.add_symbol(symbol)
    return {"message": f"Now tracking {symbol}"}

@router.post("/untrack")
def untrack_symbol(
    symbol: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove a symbol from the price stream tracking.
    """
    price_stream_producer.remove_symbol(symbol)
    return {"message": f"Stopped tracking {symbol}"}

@router.get("/status")
def get_tracking_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the list of symbols currently being tracked.
    """
    return {"tracked_symbols": list(price_stream_producer.symbols_to_track)}