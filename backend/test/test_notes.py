def test_create_note_success(client, auth_headers):
    response = client.post(
        "/notes/create",
        headers=auth_headers,
        json={
            "title": "Test note",
            "content": "Hello world"
        }
    )

    assert response.status_code == 201
    data = response.get_json()

    assert data["success"] == True
    assert data["note"]["title"] == "Test note"

def test_create_note_invalid_data(client, auth_headers):
    response = client.post(
        "/notes/create",
        headers=auth_headers,
        json={}
    )

    assert response.status_code == 400

def test_create_note_requires_login(client):
    response = client.post("/notes/create", json={
        "title": "Test", "content": "Test Content"
    })

    assert response.status_code == 401



def test_get_all_notes(client, auth_headers):
    response = client.get("/notes/", headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert "notes" in data

def test_get_notes_requires_login(client):
    response = client.get("/notes/")

    assert response.status_code == 401



def test_get_one_note_success(client, auth_headers, created_note):
    response = client.get(f"/notes/{created_note}", headers=auth_headers)

    assert response.status_code == 200

def test_get_one_note_not_found(client, auth_headers):
    response = client.get("/notes/invalid-id", headers=auth_headers)

    assert response.status_code == 404



def test_update_note(client, auth_headers, created_note):
    response = client.put(
        f"/notes/{created_note}", 
        headers=auth_headers,
        json={
            "title" : "Updated Title",
            "content": "Updated Content"
        }
    )

    assert response.status_code == 200
    data = response.get_json()
    
    assert data["note"]["title"] == "Updated Title"

def test_update_note_not_found(client, auth_headers):
    response = client.put(
        "/notes/invalid-id", 
        headers=auth_headers,
        json={
            "title" : "Updated Title",
            "content": "Updated Content"
        }
    )

    assert response.status_code == 404



def test_delete_note(client, auth_headers, created_note):
    response = client.delete(
        f"/notes/{created_note}",
        headers=auth_headers
    )

    assert response.status_code == 200

def test_delete_note_not_found(client, auth_headers):
    response = client.delete(
        "/notes/invalid-id",
        headers=auth_headers
    )

    assert response.status_code == 404


def test_user_cannot_access_other_user_note(client, auth_headers, other_user_note):
    response = client.get(
        f"/notes/{other_user_note}",
        headers=auth_headers
    )

    assert response.status_code == 404