from typing import Optional, Dict, Any, List
from app.services.firebase_service import firebase_service
from app.utils.datetime_utils import utc_iso_now
from app.utils.logging import setup_logger

logger = setup_logger("subscription_service")

AVAILABLE_PLANS: Dict[str, Dict[str, Any]] = {
    "STARTER": {
        "planId": "STARTER",
        "name": "Starter",
        "price": 0,
        "currency": "INR",
        "billingInterval": "month",
        "allowedModels": ["cyrus"],
        "priority": 1,
        "description": "Essential intelligence for personal exploration and small experiments.",
        "features": [
            "Access to CYRUS model family",
            "OpenAI SDK compatible endpoint",
            "Developer Dashboard & API Keys",
            "Standard queue scheduling",
            "Community Support"
        ]
    },
    "BASIC": {
        "planId": "BASIC",
        "name": "Basic",
        "price": 49,
        "currency": "INR",
        "billingInterval": "month",
        "allowedModels": ["cyrus"],
        "priority": 2,
        "description": "Ideal for hobbyists and developers with consistent daily workflow needs.",
        "features": [
            "Access to CYRUS model family",
            "Elevated queue priority over Starter",
            "Unlimited requests within worker capacity",
            "Usage analytics & audit logs",
            "Standard developer support"
        ]
    },
    "PRO": {
        "planId": "PRO",
        "name": "Pro",
        "price": 149,
        "currency": "INR",
        "billingInterval": "month",
        "allowedModels": ["cyrus", "cyran"],
        "priority": 3,
        "description": "Full multi-model universe for advanced engineering and production apps.",
        "features": [
            "Access to both CYRUS and CYRAN models",
            "High queue scheduling priority",
            "Complex coding and reasoning workloads",
            "Comprehensive usage metrics",
            "Priority developer support"
        ]
    },
    "ULTRA": {
        "planId": "ULTRA",
        "name": "Ultra",
        "price": 299,
        "currency": "INR",
        "billingInterval": "month",
        "allowedModels": ["cyrus", "cyran"],
        "priority": 4,
        "description": "Top-tier scheduling for power developers and critical applications.",
        "features": [
            "Access to all model families (CYRUS & CYRAN)",
            "Highest tier job scheduling priority",
            "Immediate worker queue dispatch",
            "Unlimited keys & analytics export",
            "Dedicated support channel"
        ]
    }
}


class SubscriptionService:
    def get_plans(self) -> List[Dict[str, Any]]:
        return list(AVAILABLE_PLANS.values())

    def get_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        return AVAILABLE_PLANS.get(plan_id.upper())

    def get_user_subscription(self, user_id: str) -> Dict[str, Any]:
        """Fetches active user subscription or returns default Starter plan."""
        subs = firebase_service.query_collection("subscriptions", filters=[("userId", "==", user_id)])
        if subs:
            return subs[0]
        # Fallback to creating a starter sub
        now = utc_iso_now()
        sub = {
            "subscriptionId": f"sub_{user_id}",
            "userId": user_id,
            "planId": "STARTER",
            "planName": "STARTER",
            "price": 0,
            "currency": "INR",
            "billingInterval": "month",
            "status": "active",
            "startDate": now,
            "expiryDate": None,
            "paymentProvider": "system",
            "paymentReference": "starter_free_tier",
            "createdAt": now,
            "updatedAt": now
        }
        firebase_service.set_document("subscriptions", f"sub_{user_id}", sub)
        return sub

    def check_model_access(self, user_id: str, model_id: str) -> Tuple[bool, int, str]:
        """
        Validates if user subscription grants access to requested model.
        Returns: (has_access, priority_level, reason_or_plan_name)
        """
        sub = self.get_user_subscription(user_id)
        plan_id = sub.get("planId", "STARTER").upper()
        plan_meta = AVAILABLE_PLANS.get(plan_id, AVAILABLE_PLANS["STARTER"])

        normalized_model = model_id.lower()
        if normalized_model in plan_meta["allowedModels"]:
            return True, plan_meta["priority"], plan_id
        return False, plan_meta["priority"], f"Model '{model_id}' requires a PRO or ULTRA subscription. Current plan: {plan_id}."

    def upgrade_subscription(
        self,
        user_id: str,
        plan_id: str,
        payment_provider: str = "manual",
        payment_reference: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upgrades user subscription plan."""
        plan_id_clean = plan_id.upper()
        if plan_id_clean not in AVAILABLE_PLANS:
            raise ValueError(f"Unknown subscription plan '{plan_id}'")

        plan = AVAILABLE_PLANS[plan_id_clean]
        sub_id = f"sub_{user_id}"
        now = utc_iso_now()

        sub_data = {
            "subscriptionId": sub_id,
            "userId": user_id,
            "planId": plan_id_clean,
            "planName": plan["name"],
            "price": plan["price"],
            "currency": "INR",
            "billingInterval": "month",
            "status": "active",
            "startDate": now,
            "expiryDate": None,
            "paymentProvider": payment_provider,
            "paymentReference": payment_reference or f"ref_{now[:10]}",
            "updatedAt": now
        }
        firebase_service.set_document("subscriptions", sub_id, sub_data)

        # Update user profile document
        firebase_service.update_document("users", user_id, {
            "subscriptionPlan": plan_id_clean,
            "subscriptionStatus": "active",
            "updatedAt": now
        })
        logger.info(f"User {user_id} upgraded to {plan_id_clean} (₹{plan['price']}/mo)")
        return sub_data


subscription_service = SubscriptionService()
