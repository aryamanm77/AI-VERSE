from typing import Optional, List
from pydantic import BaseModel


class SubscriptionPlan(BaseModel):
    planId: str
    name: str
    price: int  # in INR
    currency: str = "INR"
    billingInterval: str = "month"
    allowedModels: List[str]
    priority: int  # 1 (lowest) to 4 (highest)
    description: str
    features: List[str]


class UserSubscriptionResponse(BaseModel):
    subscriptionId: str
    userId: str
    planId: str
    planName: str
    price: int
    currency: str
    billingInterval: str
    status: str
    startDate: str
    expiryDate: Optional[str] = None
    paymentProvider: Optional[str] = None
    paymentReference: Optional[str] = None


class UpgradeSubscriptionRequest(BaseModel):
    planId: str  # STARTER, BASIC, PRO, ULTRA
    paymentProvider: Optional[str] = "manual"
    paymentReference: Optional[str] = None
