import uvicorn
import multiprocessing
import os

def run_dev():
    """Run the application in development mode"""
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,
        log_level="debug",
        # Remove uvloop and httptools
        loop="asyncio",
        http="auto"
    )

def run_prod():
    """Run the application in production mode"""
    # Get number of workers based on CPU cores
    workers = multiprocessing.cpu_count()
    # Ensure at least 2 workers but no more than 8
    workers = min(max(workers, 2), 8)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        workers=workers,
        log_level="info",
        reload=False,
        proxy_headers=True,
        forwarded_allow_ips="*",
        # Remove uvloop and httptools
        loop="asyncio",
        http="auto"
    )

if __name__ == "__main__":
    env = os.getenv("BACKEND_MODE", "development")
    print(f"Running in {env} mode")
    if env == "production":
        run_prod()
    else:
        run_dev() 