from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas.subscriptions import SubscriptionPlan, UserSubscriptionResponse, UpgradeSubscriptionRequest
from app.security.firebase_auth import get_current_user
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])


@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans():
    """Returns available AI VERSE subscription plans with pricing in INR."""
    return subscription_service.get_plans()


@router.get("/my", response_model=UserSubscriptionResponse)
async def get_my_subscription(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns currently authenticated user's active subscription."""
    return subscription_service.get_user_subscription(current_user["uid"])


@router.post("/upgrade", response_model=UserSubscriptionResponse)
async def upgrade_my_subscription(
    body: UpgradeSubscriptionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upgrades the authenticated user to a new subscription plan (STARTER, BASIC, PRO, ULTRA).
    Updates user document and assigns model entitlements and queue priority.
    """
    try:
        updated = subscription_service.upgrade_subscription(
            user_id=current_user["uid"],
            plan_id=body.planId,
            payment_provider=body.paymentProvider or "manual",
            payment_reference=body.paymentReference
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
