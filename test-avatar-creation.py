import requests
import json

# Simple test to create an avatar using the high-quality content generation agent
url = "http://localhost:5008/generate-avatar"
payload = {
    "platform": "synthesia",
    "avatarType": "personal",
    "voiceSample": "user_voice_sample.wav",
    "character": "politician",
    "style": "professional",
    "customization": {
        "gender": "neutral",
        "age": "middle_aged",
        "clothing": "business_suit"
    }
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")