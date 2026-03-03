# import os
# from groq import Groq
# from dotenv import load_dotenv

# load_dotenv()

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# def groq_chat(prompt: str) -> str:
#     response = client.chat.completions.create(
#         model="llama3-70b-8192",
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.2,
#     )
#     return response.choices[0].message.content
# import os
# from groq import Groq
# from dotenv import load_dotenv

# load_dotenv()

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# def get_available_model():
#     """Fetch a valid chat-capable model dynamically."""
#     models = client.models.list().data

#     # Filter models that support chat completions
#     preferred_keywords = ["llama", "mixtral", "gemma"]

#     for m in models:
#         name = m.id.lower()
#         if any(k in name for k in preferred_keywords):
#             return m.id

#     # fallback to first model if nothing matches
#     return models[0].id if models else None


# MODEL_NAME = get_available_model()
# print(f"[Groq] Using model: {MODEL_NAME}")


# def groq_chat(prompt: str) -> str:
#     if not MODEL_NAME:
#         raise RuntimeError("No available Groq models found for this API key.")

#     response = client.chat.completions.create(
#         model=MODEL_NAME,
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.2,
#     )
#     return response.choices[0].message.content
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def groq_chat(prompt: str) -> str:
    model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
    print(f"[Groq] Using model: {model_name}")

    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return response.choices[0].message.content