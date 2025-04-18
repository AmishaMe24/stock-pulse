from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    asset_id: int
    alert_type: str  # price_change, threshold_breach, etc.
    threshold_value: float
    notification_method: str  # email, sms, dashboard

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    alert_type: Optional[str] = None
    threshold_value: Optional[float] = None
    notification_method: Optional[str] = None
    is_active: Optional[bool] = None

class Alert(AlertBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True