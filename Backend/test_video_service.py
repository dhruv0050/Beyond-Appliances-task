#!/usr/bin/env python
"""
Test script to verify video analysis service setup
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from video_analysis_service import load_video_csv, get_all_video_reports_with_metadata

print("=" * 60)
print("VIDEO ANALYSIS SERVICE TEST")
print("=" * 60)

# Test 1: Load CSV
print("\n1. Loading CSV data...")
df = load_video_csv()
if df.empty:
    print("   ❌ CSV file not found or empty")
else:
    print(f"   ✓ CSV loaded successfully")
    print(f"   - Total records: {len(df)}")
    print(f"   - Columns: {list(df.columns)}")
    print(f"\n   Sample records:")
    for idx, row in df.head(3).iterrows():
        print(f"   [{idx}] {row.get('Store Name', 'Unknown')} - {row.get('Recording URL', 'No URL')[:60]}...")

# Test 2: Get all reports metadata
print("\n2. Getting all reports metadata...")
reports = get_all_video_reports_with_metadata()
if reports:
    print(f"   ✓ {len(reports)} reports found")
    for report in reports[:3]:
        print(f"   - {report['report_id']}: {report['store_name']} (Analyzed: {report['analyzed']})")
else:
    print("   ❌ No reports found")

print("\n" + "=" * 60)
print("API ENDPOINTS:")
print("=" * 60)
print("GET  /api/video-reports")
print("      → Get all video reports with status")
print("\nGET  /api/video-reports/{report_id}")
print("      → Get analysis for specific report")
print("\nPOST /api/video-reports/analyze/{report_id}")
print("      → Trigger analysis for a video")
print("\n" + "=" * 60)
