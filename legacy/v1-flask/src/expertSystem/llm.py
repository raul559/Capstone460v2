# File: expertSystem/llm.py
# Role: Thin wrapper around the OpenAI Chat Completions API (separate from Gemini).

# Linked to:
# - Optional utility if you want to use OpenAI models in parallel to Gemini
# - Not used by app.py unless you import it explicitly

# Env:
# - OPENAI_API_KEY (read via python-dotenv)

# Notes:
# - DEFAULT_MODEL is set to a fast/cheap preset; swap as needed


import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DEFAULT_MODEL = "gpt-5.1-mini"   # fast+cheap; swap to a bigger model if needed

def chat(messages, **kwargs):
    """
    Thin wrapper around Chat Completions for now.
    """
    resp = client.chat.completions.create(
        model=kwargs.get("model", DEFAULT_MODEL),
        messages=messages,
        temperature=kwargs.get("temperature", 0.2),
        response_format=kwargs.get("response_format", {"type": "text"}),
    )
    return resp.choices[0].message
