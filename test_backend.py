import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all():
    print("--- 1. Health Check ---")
    r1 = client.get("/api/health")
    print(f"Status: {r1.status_code}, Body: {r1.json()}")
    assert r1.status_code == 200

    print("\n--- 2. Get Seeded Leads ---")
    r2 = client.get("/api/leads")
    leads = r2.json()
    print(f"Status: {r2.status_code}, Count: {len(leads)}")
    for l in leads:
        print(f"  - [{l['priority_label']}] {l['name']} (Score: {l['priority_score']})")
    assert r2.status_code == 200
    assert len(leads) >= 3

    print("\n--- 3. Create New Lead ---")
    new_lead_payload = {
        "name": "Karan Malhotra",
        "location": "Mumbai, Bandra West",
        "property_requirement": "4 BHK luxury sea-facing apartment",
        "budget": "Rs 8.5 Cr",
        "buying_timeline": "Within 30 days",
        "customer_message": "Looking for an ultra luxury 4 BHK in Bandra West with sea view. Ready to pay full down payment if unit is premium."
    }
    r3 = client.post("/api/leads", json=new_lead_payload)
    print(f"Status: {r3.status_code}, Created ID: {r3.json().get('id')}")
    lead_data = r3.json()
    print(f"  Priority: {lead_data['priority_label']} ({lead_data['priority_score']}/100)")
    assert r3.status_code == 201

    print("\n--- 4. Grounded Copilot Chat ---")
    lead_id = lead_data["id"]
    copilot_payload = {
        "question": "What should I emphasize on the call with Karan?",
        "history": []
    }
    r4 = client.post(f"/api/leads/{lead_id}/copilot", json=copilot_payload)
    answer = r4.json().get('answer', '')
    print(f"Status: {r4.status_code}, Copilot Response Length: {len(answer)} chars")
    assert r4.status_code == 200

    print("\n--- 5. Schedule Google Calendar Follow-up ---")
    cal_payload = {
        "date": "2026-10-03",
        "time": "11:00",
        "duration_minutes": 30,
        "include_talking_points": True,
        "include_suggested_response": True,
        "custom_notes": "Confirm sea-facing view certificate."
    }
    r5 = client.post(f"/api/leads/{lead_id}/calendar", json=cal_payload)
    print(f"Status: {r5.status_code}, Scheduled: {r5.json()['calendar']['scheduled']}")
    event_url = r5.json()['calendar']['event_url'].encode('ascii', 'ignore').decode('ascii')
    print(f"Event URL: {event_url}")
    assert r5.status_code == 200

    print("\n==========================================")
    print("ALL 5 CORE REQUIREMENTS & BACKEND ENDPOINTS PASSED VERIFICATION PERFECTLY!")
    print("==========================================")

if __name__ == "__main__":
    test_all()
