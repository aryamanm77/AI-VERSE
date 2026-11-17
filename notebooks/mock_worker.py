"""
AI VERSE — Local Development Mock Worker
Usage:
    python mock_worker.py --worker-id cyrus-colab-1 --model CYRUS --token <TOKEN> --url http://127.0.0.1:8000
    python mock_worker.py --worker-id cyran-kaggle-1 --model CYRAN --token <TOKEN> --url http://127.0.0.1:8000

NOTE: This worker is strictly for local development and end-to-end testing.
It uses the exact same worker daemon protocol as the Google Colab and Kaggle notebooks.
"""

import argparse
import sys
import time
import httpx
from datetime import datetime


def run_mock_worker(worker_id: str, model_id: str, token: str, base_url: str, provider: str = "Local Dev"):
    print("=" * 60)
    print(f"AI VERSE LOCAL DEV WORKER: {worker_id} [{model_id}]")
    print(f"Target Gateway: {base_url}")
    print("=" * 60)

    client = httpx.Client(base_url=base_url, timeout=30.0)

    # 1. Connection check
    try:
        r = client.get("/health")
        if r.status_code != 200:
            print(f"[ERROR] Health check failed with status {r.status_code}")
            sys.exit(1)
        print("[OK] Backend connection verified.")
    except Exception as e:
        print(f"[ERROR] Could not connect to backend at {base_url}: {e}")
        sys.exit(1)

    # 2. Registration Handshake
    headers = {
        "X-Worker-Token": token,
        "X-Worker-Id": worker_id
    }
    reg_payload = {
        "worker_id": worker_id,
        "model_id": model_id.upper(),
        "provider": provider,
        "worker_version": "1.0.0"
    }

    try:
        r = client.post("/api/workers/register", json=reg_payload, headers=headers)
        if r.status_code == 200:
            print(f"[OK] Worker {worker_id} successfully registered with backend.")
        else:
            print(f"[ERROR] Registration failed: {r.status_code} - {r.text}")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Registration exception: {e}")
        sys.exit(1)

    # 3. Execution Loop
    last_heartbeat = 0
    heartbeat_interval = 15  # seconds
    current_job_id = None

    print(f"[START] Entering polling and heartbeat loop for {model_id} jobs...")
    try:
        while True:
            now = time.time()

            # Heartbeat check
            if now - last_heartbeat >= heartbeat_interval:
                status = "busy" if current_job_id else "online"
                hb_payload = {
                    "worker_id": worker_id,
                    "status": status,
                    "gpu_name": "Local Mock GPU (RTX 4090)",
                    "gpu_memory": 24576,
                    "available_memory": 22000,
                    "current_job_id": current_job_id
                }
                try:
                    hb_res = client.post("/api/workers/heartbeat", json=hb_payload, headers=headers)
                    if hb_res.status_code == 200:
                        last_heartbeat = now
                    else:
                        print(f"[WARN] Heartbeat rejected: {hb_res.status_code} - {hb_res.text}")
                except Exception as e:
                    print(f"[WARN] Heartbeat error: {e}")

            # Job Polling
            try:
                poll_res = client.get("/api/workers/jobs/next", headers=headers)
                if poll_res.status_code == 200:
                    data = poll_res.json()
                    job = data.get("job")
                    if job:
                        job_id = job["job_id"]
                        current_job_id = job_id
                        payload = job.get("payload", {})
                        messages = payload.get("messages", [])
                        last_msg = messages[-1]["content"] if messages else "No prompt"

                        print(f"\n[JOB CLAIMED] Job ID: {job_id}")
                        print(f"  Prompt: '{last_msg[:60]}...'")
                        print(f"  Processing on model {model_id}...")

                        # Simulate model inference time (1-2s)
                        start_time = time.time()
                        time.sleep(1.2)
                        latency_ms = round((time.time() - start_time) * 1000, 2)

                        # Generate response based on model family
                        if model_id.upper() == "CYRUS":
                            output_text = (
                                f"[CYRUS Intelligence Response]\n"
                                f"In response to your prompt: \"{last_msg}\"\n\n"
                                f"Here is the synthesized analysis:\n"
                                f"1. Core concept breakdown: The subject relates to distributed systems and modular AI infrastructure.\n"
                                f"2. Practical implementation: Efficiently handled via asynchronous worker pipelines.\n\n"
                                f"Executed via AI VERSE Worker '{worker_id}'."
                            )
                        else:
                            output_text = (
                                f"[CYRAN Advanced Reasoning Engine]\n"
                                f"Detailed technical breakdown for: \"{last_msg}\"\n\n"
                                f"System Analysis:\n"
                                f"• Computational Complexity: High-order reasoning applied.\n"
                                f"• Synthesis: Architectural boundaries respected with zero data leakage.\n\n"
                                f"Processed by CYRAN High-Priority Worker '{worker_id}'."
                            )

                        input_tokens = sum(len(m.get("content", "").split()) for m in messages) * 2
                        output_tokens = len(output_text.split()) * 2

                        # Submit result
                        complete_payload = {
                            "result": {
                                "text": output_text,
                                "finish_reason": "stop",
                                "prompt_tokens": input_tokens,
                                "completion_tokens": output_tokens
                            },
                            "input_tokens": input_tokens,
                            "output_tokens": output_tokens,
                            "latency_ms": latency_ms
                        }

                        comp_res = client.post(f"/api/workers/jobs/{job_id}/complete", json=complete_payload, headers=headers)
                        if comp_res.status_code == 200:
                            print(f"[JOB COMPLETE] Job {job_id} submitted successfully! ({latency_ms}ms, {output_tokens} tokens)")
                        else:
                            print(f"[JOB ERROR] Result submission failed: {comp_res.status_code} - {comp_res.text}")

                        current_job_id = None
            except Exception as e:
                print(f"[ERROR] Polling loop error: {e}")

            time.sleep(1.0)
    except KeyboardInterrupt:
        print("\n[STOP] Shutting down mock worker gracefully...")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI VERSE Mock Worker")
    parser.add_argument("--worker-id", default="cyrus-colab-1", help="Worker identifier")
    parser.add_argument("--model", default="CYRUS", help="Public model family (CYRUS [backed by Gemma 4 E4B] or CYRAN [backed by GPT-OSS 20B])")
    parser.add_argument("--token", required=True, help="Worker authentication token")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="AI VERSE Gateway Base URL")
    parser.add_argument("--provider", default="Local Dev", help="Provider name")

    args = parser.parse_args()
    run_mock_worker(
        worker_id=args.worker_id,
        model_id=args.model,
        token=args.token,
        base_url=args.url,
        provider=args.provider
    )
