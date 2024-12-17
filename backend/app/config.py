from functools import lru_cache
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_KEY")
    project_name: str = "Contract Management API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list = [
        "http://localhost:3000",  # Default React dev server
        "http://localhost:5173"   # Vite dev server
    ]

@lru_cache()
def get_settings():
    return Settings()