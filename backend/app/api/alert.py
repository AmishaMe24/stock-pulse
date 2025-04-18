from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.alert import Alert, AlertCreate, AlertUpdate
from app.db.repositories.alert import (
    get_alerts_by_asset, get_alert, create_alert, update_alert, delete_alert
)

router = APIRouter()

@router.get("/asset/{asset_id}", response_model=List[Alert])
def read_alerts_by_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all alerts for a specific asset.
    """
    alerts = get_alerts_by_asset(db, asset_id, current_user.id)
    return alerts

@router.post("/", response_model=Alert, status_code=status.HTTP_201_CREATED)
def create_new_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new alert.
    """
    db_alert = create_alert(db, alert, current_user.id)
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Asset not found or does not belong to user")
    return db_alert

@router.get("/{alert_id}", response_model=Alert)
def read_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific alert by ID.
    """
    alert = get_alert(db, alert_id, current_user.id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=Alert)
def update_alert_endpoint(
    alert_id: int,
    alert_data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an alert.
    """
    alert = update_alert(db, alert_id, alert_data, current_user.id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an alert.
    """
    success = delete_alert(db, alert_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"detail": "Alert deleted successfully"}