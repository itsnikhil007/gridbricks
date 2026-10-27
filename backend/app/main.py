"""
Main FastAPI Application Entrypoint
Gridbricks UK Day-Ahead Electricity Market Wind Forecast & Accuracy Platform
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="Gridbricks UK Day-Ahead Wind Forecast Platform",
    description="Decision-support and forecast accuracy evaluation portal for UK Day-Ahead wholesale power market.",
    version="1.0.0"
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints under /api
app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Gridbricks UK Wind Forecast Platform",
        "market": "GB Electricity Wholesale Day-Ahead (EPEX/NordPool)",
        "dataset_scope": "January 2026 Elexon BMRS (FUELHH + WINDFOR)"
    }

# Serve frontend static assets if built
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend", "dist"
)

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
