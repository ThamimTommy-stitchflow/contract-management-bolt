from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routers import company, apps, auth,contracts


settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(company.router, prefix="/api/companies", tags=["companies"])
app.include_router(apps.router, prefix="/api/apps", tags=["apps"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["contracts"])

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}