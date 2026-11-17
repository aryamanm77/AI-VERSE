from app.services.subscription_service import subscription_service
from app.services.auth_service import auth_service


def test_subscription_plans(client):
    response = client.get("/api/subscriptions/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) == 4

    plan_ids = {p["planId"]: p for p in plans}
    assert "STARTER" in plan_ids
    assert "BASIC" in plan_ids
    assert "PRO" in plan_ids
    assert "ULTRA" in plan_ids

    assert plan_ids["STARTER"]["price"] == 0
    assert plan_ids["BASIC"]["price"] == 49
    assert plan_ids["PRO"]["price"] == 149
    assert plan_ids["ULTRA"]["price"] == 299


def test_model_access_entitlements():
    user_id = "test_sub_user_1"
    auth_service.get_or_create_user(user_id)

    # By default, STARTER plan
    has_cyrus, prio, _ = subscription_service.check_model_access(user_id, "cyrus")
    assert has_cyrus is True
    assert prio == 1

    has_cyran, prio, reason = subscription_service.check_model_access(user_id, "cyran")
    assert has_cyran is False
    assert "requires a PRO or ULTRA subscription" in reason

    # Upgrade to PRO
    subscription_service.upgrade_subscription(user_id, "PRO")
    has_cyran, prio, _ = subscription_service.check_model_access(user_id, "cyran")
    assert has_cyran is True
    assert prio == 3

    # Upgrade to ULTRA
    subscription_service.upgrade_subscription(user_id, "ULTRA")
    has_cyran, prio, _ = subscription_service.check_model_access(user_id, "cyran")
    assert has_cyran is True
    assert prio == 4
