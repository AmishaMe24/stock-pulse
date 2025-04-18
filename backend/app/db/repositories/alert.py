from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.portfolio import Alert, Asset
from app.schemas.alert import AlertCreate, AlertUpdate

def get_alerts_by_asset(db: Session, asset_id: int, user_id: int) -> List[Alert]:
    return db.query(Alert).join(Asset).join(Asset.portfolio).filter(
        Alert.asset_id == asset_id,
        Asset.portfolio.has(user_id=user_id)
    ).all()

def get_alert(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
    return db.query(Alert).join(Asset).join(Asset.portfolio).filter(
        Alert.id == alert_id,
        Asset.portfolio.has(user_id=user_id)
    ).first()

def create_alert(db: Session, alert: AlertCreate, user_id: int) -> Optional[Alert]:
    # Verify that the asset belongs to the user
    asset_exists = db.query(Asset).join(Asset.portfolio).filter(
        Asset.id == alert.asset_id,
        Asset.portfolio.has(user_id=user_id)
    ).first()
    
    if not asset_exists:
        return None
    
    db_alert = Alert(
        asset_id=alert.asset_id,
        alert_type=alert.alert_type,
        threshold_value=alert.threshold_value,
        notification_method=alert.notification_method,
        is_active=True
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def update_alert(db: Session, alert_id: int, alert: AlertUpdate, user_id: int) -> Optional[Alert]:
    db_alert = get_alert(db, alert_id, user_id)
    if db_alert:
        update_data = alert.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_alert, key, value)
        db.commit()
        db.refresh(db_alert)
    return db_alert

def delete_alert(db: Session, alert_id: int, user_id: int) -> bool:
    db_alert = get_alert(db, alert_id, user_id)
    if db_alert:
        db.delete(db_alert)
        db.commit()
        return True
    return False