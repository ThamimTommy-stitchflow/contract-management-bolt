from supabase import create_client, Client
from .config import get_settings
from functools import lru_cache
from typing import Generator

settings = get_settings()

@lru_cache()
def get_supabase_client() -> Client:
    """Get a cached Supabase client instance"""
    return create_client(settings.supabase_url, settings.supabase_key)

def get_db() -> Generator[Client, None, None]:
    """
    Get database connection.
    Using generator pattern for future flexibility with connection management
    """
    try:
        db = get_supabase_client()
        yield db
    except Exception as e:
        print(f"Database connection error: {e}")
        raise