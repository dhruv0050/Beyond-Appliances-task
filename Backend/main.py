from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from pathlib import Path
import uvicorn

from gemini_service import analyze_video_with_gemini
from drive_downloader import download_from_drive


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
class DriveURLRequest(BaseModel):
    url: str
    video_id: str


class BatchAnalysisRequest(BaseModel):
    videos: List[DriveURLRequest]


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Duroflex Video Analysis API",
        "status": "running",
        "endpoints": {
            "analyze_drive_url": "POST /api/analyze/drive-url",
            "analyze_batch": "POST /api/analyze/batch",
            "get_result": "GET /api/results/{video_id}",
            "get_all_results": "GET /api/results",
            "health": "GET /api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Duroflex Video Analysis"}


@app.post("/api/analyze/drive-url")
async def analyze_drive_video(request: DriveURLRequest):
    """
    Analyze a single video from Google Drive URL
    """
    try:
        video_id = request.video_id
        drive_url = request.url
        
        print(f"Processing video {video_id} from {drive_url}")
        
        # Check if result already exists
        result_path = RESULTS_DIR / f"video_{video_id}.json"
        if result_path.exists():
            print(f"Result already exists for video {video_id}")
            with open(result_path, 'r', encoding='utf-8') as f:
                return {"status": "success", "data": json.load(f), "video_id": video_id}
        
        # Step 1: Download video from Google Drive
        print(f"Downloading video from Google Drive...")
        video_path = download_from_drive(drive_url, video_id)
        
        if not video_path or not os.path.exists(video_path):
            raise HTTPException(status_code=400, detail="Failed to download video from Google Drive")
        
        # Step 2: Analyze video using Gemini
        print(f"Analyzing video with Gemini AI...")
        analysis_result = analyze_video_with_gemini(video_path)
        
        # Step 3: Save result
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, indent=2, ensure_ascii=False)
        
        # Step 4: Cleanup temp video file
        try:
            os.remove(video_path)
            print(f"Cleaned up temporary video file: {video_path}")
        except Exception as e:
            print(f"Warning: Could not delete temp file: {e}")
        
        return {
            "status": "success",
            "message": f"Video {video_id} analyzed successfully",
            "video_id": video_id,
            "data": analysis_result
        }
        
    except Exception as e:
        print(f"Error analyzing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")


@app.post("/api/analyze/batch")
async def analyze_batch_videos(request: BatchAnalysisRequest):
    """
    Analyze multiple videos in batch (sequential processing)
    """
    results = []
    
    for idx, video in enumerate(request.videos, 1):
        print(f"\n{'='*60}")
        print(f"Processing video {idx}/{len(request.videos)}")
        print(f"{'='*60}\n")
        
        try:
            result = await analyze_drive_video(video)
            results.append({
                "video_id": video.video_id,
                "status": "success",
                "result": result
            })
        except Exception as e:
            results.append({
                "video_id": video.video_id,
                "status": "error",
                "error": str(e)
            })
    
    return {
        "status": "completed",
        "total": len(request.videos),
        "results": results
    }


@app.get("/api/results/{video_id}")
async def get_result(video_id: str):
    """
    Get analysis result for a specific video
    """
    result_path = RESULTS_DIR / f"video_{video_id}.json"
    
    if not result_path.exists():
        raise HTTPException(status_code=404, detail=f"Results not found for video {video_id}")
    
    with open(result_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return {
        "status": "success",
        "video_id": video_id,
        "data": data
    }


@app.get("/api/results")
async def get_all_results():
    """
    Get all video analysis results
    """
    results = []
    
    for result_file in RESULTS_DIR.glob("video_*.json"):
        try:
            with open(result_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                video_id = result_file.stem.replace("video_", "")
                results.append({
                    "video_id": video_id,
                    "data": data
                })
        except Exception as e:
            print(f"Error reading {result_file}: {e}")
    
    return {
        "status": "success",
        "count": len(results),
        "results": results
    }


@app.delete("/api/results/{video_id}")
async def delete_result(video_id: str):
    """
    Delete analysis result for a specific video
    """
    result_path = RESULTS_DIR / f"video_{video_id}.json"
    
    if not result_path.exists():
        raise HTTPException(status_code=404, detail=f"Results not found for video {video_id}")
    
    os.remove(result_path)
    
    return {
        "status": "success",
        "message": f"Results for video {video_id} deleted successfully"
    }


if __name__ == "__main__":
    print("Starting Duroflex Video Analysis API...")
    print("API will be available at http://localhost:8000")
    print("API docs at http://localhost:8000/docs")
    # Use import string form to allow reload without warnings
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
