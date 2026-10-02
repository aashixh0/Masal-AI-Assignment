"""
LeadPilot - Gemini API Diagnostic Script
Run: python test_gemini.py

Tests:
  1. .env file loading
  2. Gemini client initialization
  3. Basic text generation (ping)
  4. Copilot grounding test with a real lead question
"""

import os
import sys

# 1. Load .env
print("\n" + "=" * 60)
print("  LEADPILOT GEMINI API DIAGNOSTIC")
print("=" * 60)

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=True)
    print("\n[1] .env file       : LOADED")
except ImportError:
    print("\n[1] .env file       : FAILED - python-dotenv not installed")
    sys.exit(1)

api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    print(f"    GEMINI_API_KEY  : SET  (starts with: {api_key[:15]}...)")
else:
    print("    GEMINI_API_KEY  : *** EMPTY - fix your .env file! ***")
    sys.exit(1)

# 2. Initialize Gemini client
print("\n[2] Gemini client   : Initializing...")
try:
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=api_key)
    print("    Client          : OK")
except ImportError:
    print("    Client          : FAILED - google-genai not installed")
    sys.exit(1)
except Exception as e:
    print(f"    Client          : FAILED - {e}")
    sys.exit(1)

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
print(f"    Model           : {MODEL}")

# 3. Ping test
print("\n[3] Basic ping test : Sending request to Gemini API...")
try:
    ping = client.models.generate_content(
        model=MODEL,
        contents="Reply with exactly: GEMINI_OK",
        config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=10)
    )
    ping_text = (ping.text or "").strip()
    print(f"    Response        : OK  -> '{ping_text}'")
except Exception as e:
    print(f"    Response        : FAILED - {e}")
    sys.exit(1)

# 4. Copilot grounding test
print("\n[4] Copilot test    : Testing grounded question answering...")

LEAD_CONTEXT = """
============================================
LEAD PROFILE DATA (Source of Truth)
============================================
Name:                Rahul Sharma
Location:            Mumbai, Andheri East / Powai
Property Req:        3 BHK ready-to-move apartment near metro station
Budget:              Rs.1.8 Cr
Buying Timeline:     Within 30 days
Priority:            HOT (Score: 88.8/100)

Customer Message: "Looking for a 3 BHK in Andheri East or Powai under 1.8 Cr. Need ready-to-move because my rent lease ends next month. Please share properties near metro line."
"""

SYSTEM = "You are LeadPilot Copilot - answer ONLY from the lead data provided. Be concise."

questions = [
    "What is Rahul Sharma's budget for the property?",
    "Which areas is Rahul Sharma looking in?",
    "What are the customer's biggest concerns?",
]

all_passed = True
for q in questions:
    print(f"\n    Q: {q}")
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=f"{LEAD_CONTEXT}\n\nQUESTION: {q}\n\nAnswer ONLY from the lead data above:",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM,
                temperature=0.1,
                max_output_tokens=200
            )
        )
        answer = (resp.text or "").strip()
        if answer:
            print(f"    A: {answer[:300]}")
        else:
            print("    A: *** EMPTY RESPONSE ***")
            all_passed = False
    except Exception as e:
        print(f"    A: *** ERROR - {e} ***")
        all_passed = False

# Summary
print("\n" + "=" * 60)
if all_passed:
    print("  RESULT: ALL TESTS PASSED - Gemini API is working!")
    print("  If the UI still shows fallback, RESTART python run.py")
else:
    print("  RESULT: SOME TESTS FAILED - check API key / model name")
print("=" * 60 + "\n")
