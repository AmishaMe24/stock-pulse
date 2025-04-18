import requests
from typing import Dict, Any, Optional, List
import os
from app.core.config import settings

class StockService:
    def __init__(self):
        self.api_key = settings.STOCK_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
    
    def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get the latest price and volume information for a security of your choice.
        """
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.api_key
        }
        
        response = requests.get(self.base_url, params=params)
        if response.status_code != 200:
            return None
        
        data = response.json()
        if "Global Quote" not in data or not data["Global Quote"]:
            return None
        
        return data["Global Quote"]
    
    def search_symbol(self, keywords: str) -> List[Dict[str, str]]:
        """
        Search for stocks by keywords/company name.
        """
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": keywords,
            "apikey": self.api_key
        }
        
        response = requests.get(self.base_url, params=params)
        if response.status_code != 200:
            return []
        
        data = response.json()
        if "bestMatches" not in data:
            return []
        
        return data["bestMatches"]
    
    def get_daily_prices(self, symbol: str, compact: bool = True) -> Optional[Dict[str, Any]]:
        """
        Get daily time series of the stock.
        """
        output_size = "compact" if compact else "full"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": output_size,
            "apikey": self.api_key
        }
        
        response = requests.get(self.base_url, params=params)
        if response.status_code != 200:
            return None
        
        return response.json()

stock_service = StockService()