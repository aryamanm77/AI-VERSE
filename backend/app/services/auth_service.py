from typing import Optional, Dict, Any, List
from app.services.firebase_service import firebase_service
from app.utils.datetime_utils import utc_iso_now
from app.utils.logging import setup_logger

logger = setup_logger("auth_service")


class AuthService:
    def get_or_create_user(self, uid: str, email: Optional[str] = None, display_name: Optional[str] = None) -> Dict[str, Any]:
        """Fetch user profile or initialize new user in Firestore."""
        user = firebase_service.get_document("users", uid)
        now = utc_iso_now()
        if not user:
            user = {
                "uid": uid,
                "displayName": display_name or (email.split("@")[0] if email else "AI Verse User"),
                "email": email or "",
                "photoURL": None,
                "role": "admin" if (email and ("admin@" in email.lower() or email.lower().startswith("admin"))) else "user",
                "accountStatus": "active",
                "subscriptionPlan": "STARTER",
                "subscriptionStatus": "active",
                "createdAt": now,
                "updatedAt": now,
                "emailVerified": False
            }
            firebase_service.set_document("users", uid, user)
            logger.info(f"Initialized new user record for UID: {uid}")

            # Also initialize default subscription record
            default_sub = {
                "subscriptionId": f"sub_{uid}",
                "userId": uid,
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
            firebase_service.set_document("subscriptions", f"sub_{uid}", default_sub)
        return user

    def update_user_profile(self, uid: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        # Filter permitted fields
        allowed = {"displayName", "photoURL"}
        filtered = {k: v for k, v in updates.items() if k in allowed and v is not None}
        filtered["updatedAt"] = utc_iso_now()
        firebase_service.update_document("users", uid, filtered)
        return firebase_service.get_document("users", uid) or {}

    def set_user_status(self, uid: str, status: str) -> bool:
        if status not in {"active", "suspended", "disabled"}:
            raise ValueError(f"Invalid account status: {status}")
        return firebase_service.update_document("users", uid, {
            "accountStatus": status,
            "updatedAt": utc_iso_now()
        })

    def set_user_role(self, uid: str, role: str) -> bool:
        if role not in {"user", "admin"}:
            raise ValueError(f"Invalid role: {role}")
        return firebase_service.update_document("users", uid, {
            "role": role,
            "updatedAt": utc_iso_now()
        })

    def list_users(self, limit: int = 100) -> List[Dict[str, Any]]:
        return firebase_service.query_collection("users", limit=limit)


auth_service = AuthService()
