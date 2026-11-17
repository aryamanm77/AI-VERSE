def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_readiness_check(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["ready"] is True


def test_system_status(client):
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "cyrus" in data["models"]
    assert "cyran" in data["models"]
