from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Ovarian Disease Diagnosis Decision Support System API",
        description="FastAPI Backend for PyTorch/SVM/XGBoost models diagnosing ovarian cysts and PCOS from ultrasound scans.",
        version="1.0.0"
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow React frontend from any origin for ease of use
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include Router
    app.include_router(router, prefix="/api")
    
    return app
