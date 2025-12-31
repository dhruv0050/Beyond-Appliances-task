import pandas as pd
import json
from pathlib import Path

CSV_PATH = Path(__file__).parent / "staff_quality_analysis_results.csv"

def load_call_reports():
    """Load and parse all call reports from CSV"""
    try:
        df = pd.read_csv(CSV_PATH)
        reports = []
        
        for _, row in df.iterrows():
            # Parse the JSON string
            try:
                analysis_json = json.loads(row['call_analysis_json'])
                
                # Flatten the structure
                report = {
                    # Metadata from CSV
                    "call_id": str(row['CleanNumber']),
                    "store_name": row['Store Name'],
                    "locality": row['Locality'],
                    "city": row['City'],
                    "state": row['State'],
                    "region": row['Region'],
                    "recording_url": row['Recording URL'],
                    "duration_seconds": row['Duration'],
                    "call_date": row['Date'],
                    "month": row['Month'],
                    "is_converted": bool(row['is_converted']),
                    
                    # Analysis data - flattened
                    "analysis": analysis_json if not isinstance(analysis_json, str) else {"error": analysis_json}
                }
                
                reports.append(report)
            except json.JSONDecodeError:
                # Handle error cases
                reports.append({
                    "call_id": str(row['CleanNumber']),
                    "store_name": row['Store Name'],
                    "city": row['City'],
                    "state": row['State'],
                    "region": row['Region'],
                    "call_date": row['Date'],
                    "duration_seconds": row['Duration'],
                    "is_converted": bool(row['is_converted']),
                    "analysis": {"error": row['call_analysis_json']}
                })
        
        return reports
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return []


def get_call_report_by_id(call_id: str):
    """Get a specific call report by call ID"""
    reports = load_call_reports()
    for report in reports:
        if report['call_id'] == call_id:
            return report
    return None


def get_call_stats():
    """Get aggregate statistics"""
    reports = load_call_reports()
    
    total = len(reports)
    converted = sum(1 for r in reports if r.get('is_converted'))
    
    # Count by region
    regions = {}
    for r in reports:
        region = r.get('region', 'Unknown')
        regions[region] = regions.get(region, 0) + 1
    
    return {
        "total_calls": total,
        "converted_calls": converted,
        "conversion_rate": round(converted / total * 100, 1) if total > 0 else 0,
        "regions": regions
    }
