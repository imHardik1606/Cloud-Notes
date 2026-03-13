def test_login_invalid(client):
    response = client.post("/auth/login", json={
        "email": "wrong@test.com",
        "password": "123456"
    })

    assert response.status_code == 401

def test_login_missing_fields(client):
    response = client.post("/auth/login", json={})

    assert response.status_code == 400

def test_signup_success(client):
    response = client.post("/auth/signup", json={
        "email": "test0@example.com",
        "password": "123456",
        "username": "testuser"
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] == True

def test_signup_duplicate_email(client):
    user = {
        "email": "test2@example.com",
        "password": "123456",
        "username": "user1"
    }

    client.post("/auth/signup", json=user)

    response = client.post("/auth/signup", json=user)

    assert response.status_code == 400

def test_signup_invalid_data(client):
    response = client.post("/auth/signup", json={})

    assert response.status_code == 400