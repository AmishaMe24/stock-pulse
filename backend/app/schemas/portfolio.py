from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class AssetBase(BaseModel):
    symbol: str
    asset_type: str
    quantity: float
    purchase_price: float

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    portfolio_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioUpdate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    assets: List[Asset] = []

    class Config:
        orm_mode = True