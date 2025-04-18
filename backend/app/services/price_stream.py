import json
import time
import threading
from typing import Dict, Any
from kafka import KafkaProducer
from app.core.config import settings
from app.services.stock_service import stock_service

class PriceStreamProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        self.topic = "stock-price-updates"
        self.running = False
        self.thread = None
        self.symbols_to_track = set()
    
    def add_symbol(self, symbol: str):
        """Add a symbol to track"""
        self.symbols_to_track.add(symbol)
    
    def remove_symbol(self, symbol: str):
        """Remove a symbol from tracking"""
        if symbol in self.symbols_to_track:
            self.symbols_to_track.remove(symbol)
    
    def _fetch_and_publish_prices(self):
        """Fetch prices for tracked symbols and publish to Kafka"""
        while self.running:
            for symbol in list(self.symbols_to_track):
                try:
                    quote = stock_service.get_quote(symbol)
                    if quote:
                        # Extract relevant data
                        price_data = {
                            "symbol": symbol,
                            "price": float(quote.get("05. price", 0)),
                            "timestamp": int(time.time())
                        }
                        # Publish to Kafka
                        self.producer.send(self.topic, price_data)
                        print(f"Published price update for {symbol}: {price_data['price']}")
                except Exception as e:
                    print(f"Error fetching price for {symbol}: {str(e)}")
            
            # Sleep to avoid hitting API rate limits
            # Alpha Vantage free tier allows 5 requests per minute
            time.sleep(15)  # Adjust based on number of symbols and API limits
    
    def start(self):
        """Start the price stream producer"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._fetch_and_publish_prices)
            self.thread.daemon = True
            self.thread.start()
            print("Price stream producer started")
    
    def stop(self):
        """Stop the price stream producer"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
            print("Price stream producer stopped")

# Create a singleton instance
price_stream_producer = PriceStreamProducer()