from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from pathlib import Path
import uvicorn
from datetime import timedelta
import asyncio

from csv_analysis_service import load_call_reports, get_call_report_by_id, get_call_stats
from video_analysis_service import analyze_video_with_gemini, get_all_video_reports_with_metadata, get_video_analysis_by_id, save_video_analysis
from auth_service import authenticate_admin, create_access_token, create_admin_in_db
from preprocess_videos import preprocess_all_videos


app = FastAPI(title="Duroflex Video Analysis API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
RESULTS_DIR = Path("results")
TEMP_DIR = Path("temp")
RESULTS_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)


# Request models
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    email: str


# ===== STARTUP EVENT =====

@app.on_event("startup")
async def startup_event():
    """Initialize admin user and preprocess videos on startup"""
    print("\n🚀 APPLICATION STARTUP")
    print("=" * 80)
    
    # Create admin user
    print("👤 Initializing admin user...")
    create_admin_in_db()
    
    # Preprocess all videos
    print("🎬 Starting video preprocessing...")
    print("=" * 80)
    try:
        await preprocess_all_videos()
    except Exception as e:
        print(f"⚠️  Warning: Video preprocessing encountered an issue: {e}")
        print("   System will continue, but some videos may not be analyzed")
    
    print("=" * 80)
    print("✅ APPLICATION READY")
    print("=" * 80 + "\n")


# ===== AUTHENTICATION ENDPOINTS =====

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Admin login endpoint
    Credentials: admin@duroflex.com / duroflex123
    """
    if not authenticate_admin(request.email, request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": request.email},
        expires_delta=timedelta(days=1)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": request.email
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Duroflex Video Analysis API",
        "status": "running",
        "endpoints": {
            "login": "POST /api/auth/login",
            "video_reports": "GET /api/video-reports",
            "video_report_detail": "GET /api/video-reports/{report_id}",
            "analyze_video": "POST /api/video-reports/analyze",
            "get_result": "GET /api/results/{video_id}",
            "get_all_results": "GET /api/results",
            "health": "GET /api/health",
            "call_reports": "GET /api/call-reports"
        }
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Duroflex Video Analysis"}


# ===== VIDEO ANALYSIS ENDPOINTS (NEW) =====

@app.get("/api/video-reports")
async def get_all_video_reports():
    """Get all video reports from CSV with analysis status"""
    try:
        reports = get_all_video_reports_with_metadata()
        return {
            "status": "success",
            "total": len(reports),
            "reports": reports
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/video-reports/{report_id}")
async def get_video_report_detail(report_id: str):
    """Get detailed analysis for a specific video report"""
    try:
        analysis = get_video_analysis_by_id(report_id)
        if not analysis:
            raise HTTPException(status_code=404, detail=f"Analysis not found for report {report_id}")
        
        return {
            "status": "success",
            "report_id": report_id,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/video-reports/analyze/{report_id}")
async def analyze_video_report(report_id: str):
    """Trigger analysis for a specific video by report_id"""
    try:
        # Get all reports
        reports = get_all_video_reports_with_metadata()
        
        # Find the specific report
        target_report = None
        for report in reports:
            if report["report_id"] == report_id:
                target_report = report
                break
        
        if not target_report:
            raise HTTPException(status_code=404, detail=f"Video report {report_id} not found")
        
        # Check if already analyzed
        if target_report["analyzed"]:
            return {
                "status": "success",
                "message": "Video already analyzed",
                "report_id": report_id,
                "analysis": target_report["analysis_data"]
            }
        
        # Analyze the video
        print(f"Starting analysis for {report_id}...")
        analysis_result = analyze_video_with_gemini(
            video_url=target_report["recording_url"],
            store_name=target_report["store_name"]
        )
        
        # Save the analysis
        save_video_analysis(report_id, analysis_result)
        
        return {
            "status": "success",
            "message": f"Video {report_id} analyzed successfully",
            "report_id": report_id,
            "analysis": analysis_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")


# ===== CSV CALL ANALYSIS ENDPOINTS =====

@app.get("/api/call-reports")
async def get_all_call_reports():
    """Get all call analysis reports from CSV"""
    try:
        reports = load_call_reports()
        return {
            "status": "success",
            "total": len(reports),
            "reports": reports
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/call-reports/{call_id}")
async def get_call_report(call_id: str):
    """Get a specific call report by call ID"""
    try:
        report = get_call_report_by_id(call_id)
        if not report:
            raise HTTPException(status_code=404, detail=f"Call report not found for ID {call_id}")
        return {
            "status": "success",
            "report": report
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/call-reports/stats/overview")
async def get_call_reports_stats():
    """Get aggregate statistics for all call reports"""
    try:
        stats = get_call_stats()
        return {
            "status": "success",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("Starting Duroflex Video Analysis API...")
    print("API will be available at http://localhost:8000")
    print("API docs at http://localhost:8000/docs")
    # Use import string form to allow reload without warnings
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
