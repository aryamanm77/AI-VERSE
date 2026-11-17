from typing import Optional, Dict, Any, List
from app.services.firebase_service import firebase_service
from app.utils.logging import setup_logger

logger = setup_logger("usage_service")


class UsageService:
    def get_user_usage_summary(self, user_id: str) -> Dict[str, Any]:
        """Calculates real usage statistics for a specific user from request_logs."""
        logs = firebase_service.query_collection("request_logs", filters=[("userId", "==", user_id)])

        total_requests = len(logs)
        successful_requests = sum(1 for log in logs if log.get("status") == "success")
        failed_requests = total_requests - successful_requests

        total_tokens = sum(log.get("totalTokens", 0) for log in logs)
        prompt_tokens = sum(log.get("inputTokens", 0) for log in logs)
        completion_tokens = sum(log.get("outputTokens", 0) for log in logs)

        latencies = [log.get("latencyMs", 0) for log in logs if log.get("latencyMs", 0) > 0]
        avg_latency = (sum(latencies) / len(latencies)) if latencies else 0.0

        model_breakdown: Dict[str, int] = {}
        for log in logs:
            m = log.get("modelId", "UNKNOWN").lower()
            model_breakdown[m] = model_breakdown.get(m, 0) + 1

        return {
            "totalRequests": total_requests,
            "successfulRequests": successful_requests,
            "failedRequests": failed_requests,
            "totalTokens": total_tokens,
            "promptTokens": prompt_tokens,
            "completionTokens": completion_tokens,
            "averageLatencyMs": round(avg_latency, 2),
            "modelBreakdown": model_breakdown
        }

    def get_user_request_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns request history logs for user."""
        return firebase_service.query_collection(
            "request_logs",
            filters=[("userId", "==", user_id)],
            order_by="createdAt",
            descending=True,
            limit=limit
        )

    def get_platform_admin_overview(self) -> Dict[str, Any]:
        """Calculates global platform metrics for admin dashboard."""
        users = firebase_service.query_collection("users")
        workers = firebase_service.query_collection("workers")
        jobs = firebase_service.query_collection("request_jobs")
        logs = firebase_service.query_collection("request_logs")

        # Worker status counts
        online_workers = sum(1 for w in workers if w.get("status") == "online")
        busy_workers = sum(1 for w in workers if w.get("status") == "busy")
        offline_workers = sum(1 for w in workers if w.get("status") == "offline")
        disabled_workers = sum(1 for w in workers if w.get("status") == "disabled")

        # Job status counts
        queued_jobs = sum(1 for j in jobs if j.get("status") == "queued")
        processing_jobs = sum(1 for j in jobs if j.get("status") in {"assigned", "processing"})
        completed_jobs = sum(1 for j in jobs if j.get("status") == "completed")
        failed_jobs = sum(1 for j in jobs if j.get("status") in {"failed", "expired"})

        # Subscriptions breakdown
        sub_dist: Dict[str, int] = {}
        for u in users:
            plan = u.get("subscriptionPlan", "STARTER")
            sub_dist[plan] = sub_dist.get(plan, 0) + 1

        return {
            "totalUsers": len(users),
            "activeUsers": sum(1 for u in users if u.get("accountStatus") == "active"),
            "subscriptionDistribution": sub_dist,
            "workers": {
                "total": len(workers),
                "online": online_workers,
                "busy": busy_workers,
                "offline": offline_workers,
                "disabled": disabled_workers
            },
            "jobs": {
                "total": len(jobs),
                "queued": queued_jobs,
                "processing": processing_jobs,
                "completed": completed_jobs,
                "failed": failed_jobs
            },
            "totalLogs": len(logs)
        }


usage_service = UsageService()
