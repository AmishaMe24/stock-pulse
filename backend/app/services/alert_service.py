import json
import threading
import time
from typing import Dict, Any
from kafka import KafkaConsumer
import redis
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.portfolio import Alert, Asset
from app.core.config import settings

class AlertService:
    def __init__(self):
        self.consumer = KafkaConsumer(
            "stock-price-updates",
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
        self.running = False
        self.thread = None
    
    def _process_price_updates(self):
        """Process price updates from Kafka and check against alert thresholds"""
        while self.running:
            for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    price_data = message.value
                    symbol = price_data.get("symbol")
                    price = price_data.get("price")
                    
                    if not symbol or not price:
                        continue
                    
                    # Get all assets with this symbol
                    with SessionLocal() as db:
                        assets = db.query(Asset).filter(Asset.symbol == symbol).all()
                        
                        for asset in assets:
                            # Get all active alerts for this asset
                            alerts = db.query(Alert).filter(
                                Alert.asset_id == asset.id,
                                Alert.is_active == True
                            ).all()
                            
                            for alert in alerts:
                                self._check_and_trigger_alert(db, alert, asset, price)
                
                except Exception as e:
                    print(f"Error processing price update: {str(e)}")
    
    def _check_and_trigger_alert(self, db: Session, alert: Alert, asset: Asset, current_price: float):
        """Check if an alert should be triggered based on current price"""
        should_trigger = False
        
        if alert.alert_type == "price_above" and current_price > alert.threshold_value:
            should_trigger = True
        elif alert.alert_type == "price_below" and current_price < alert.threshold_value:
            should_trigger = True
        elif alert.alert_type == "price_change_percent":
            # Calculate percent change from purchase price
            if asset.purchase_price > 0:
                percent_change = ((current_price - asset.purchase_price) / asset.purchase_price) * 100
                if abs(percent_change) > alert.threshold_value:
                    should_trigger = True
        
        if should_trigger:
            # Check if we've already sent this alert recently (rate limiting)
            alert_key = f"alert:{alert.id}:triggered"
            if not self.redis_client.exists(alert_key):
                # Send the alert
                self._send_alert(db, alert, asset, current_price)
                
                # Set rate limiting in Redis (don't send the same alert for 1 hour)
                self.redis_client.setex(alert_key, 3600, "1")
    
    def _send_alert(self, db: Session, alert: Alert, asset: Asset, current_price: float):
        """Send an alert notification"""
        try:
            # Get user information
            portfolio = asset.portfolio
            user = portfolio.user
            
            message = f"Alert for {asset.symbol}: Current price ${current_price} has triggered your {alert.alert_type} alert (threshold: {alert.threshold_value})."
            
            # Send notification based on method
            if alert.notification_method == "email":
                print(f"Sending email to {user.email}: {message}")
                # TODO: Implement actual email sending via SendGrid or similar
            
            elif alert.notification_method == "sms":
                print(f"Sending SMS to user {user.id}: {message}")
                # TODO: Implement actual SMS sending via Twilio or similar
            
            # Always log to dashboard (will be fetched by frontend)
            print(f"Dashboard notification for user {user.id}: {message}")
            # TODO: Store notification in database for dashboard
            
            print(f"Alert triggered: {message}")
        
        except Exception as e:
            print(f"Error sending alert: {str(e)}")
    
    def start(self):
        """Start the alert service"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._process_price_updates)
            self.thread.daemon = True
            self.thread.start()
            print("Alert service started")
    
    def stop(self):
        """Stop the alert service"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
            print("Alert service stopped")

# Create a singleton instance
alert_service = AlertService()