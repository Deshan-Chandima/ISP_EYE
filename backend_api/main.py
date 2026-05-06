import sys
import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import csv
import io

# Add the parent directory to sys.path so we can import from backend_api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api.database import get_db, NetworkMetric, AppTrafficLog, engine, Base
from data_pipeline.extract_metrics import run_speedtest

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ISP Eye Backend API")

# Configure CORS so the React frontend can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# SPEED TEST ENDPOINTS
# ========================================

@app.get("/api/current-status")
def get_current_status(db: Session = Depends(get_db)):
    latest = db.query(NetworkMetric).order_by(NetworkMetric.timestamp.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No data found")
    return latest

@app.get("/api/historical-data")
def get_historical_data(hours: int = 24, db: Session = Depends(get_db)):
    """Fetch historical data. Use hours param: 24, 168 (7d), or 720 (30d)."""
    start_date = datetime.utcnow() - timedelta(hours=hours)

    results = db.query(
        func.date(NetworkMetric.timestamp).label("test_date"),
        func.avg(NetworkMetric.download_mbps).label("avg_download"),
        func.avg(NetworkMetric.upload_mbps).label("avg_upload"),
        func.avg(NetworkMetric.latency_ms).label("avg_ping"),
        func.count(case((NetworkMetric.status == 'FAILED', 1))).label("outage_count")
    ).filter(
        NetworkMetric.timestamp >= start_date
    ).group_by(
        func.date(NetworkMetric.timestamp)
    ).order_by(
        func.date(NetworkMetric.timestamp).asc()
    ).all()

    raw_data = db.query(NetworkMetric).filter(
        NetworkMetric.timestamp >= start_date
    ).order_by(NetworkMetric.timestamp.asc()).all()

    return {
        "daily_summaries": [
            {
                "test_date": str(r.test_date),
                "avg_download": round(r.avg_download, 2) if r.avg_download else 0,
                "avg_upload": round(r.avg_upload, 2) if r.avg_upload else 0,
                "avg_ping": round(r.avg_ping, 2) if r.avg_ping else 0,
                "outage_count": r.outage_count
            } for r in results
        ],
        "raw_data": raw_data
    }

@app.get("/api/outages")
def get_outages(hours: int = 168, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(hours=hours)
    failed = db.query(NetworkMetric).filter(
        NetworkMetric.timestamp >= start_date,
        NetworkMetric.status == 'FAILED'
    ).order_by(NetworkMetric.timestamp.desc()).all()
    return failed

@app.get("/api/export-csv")
def export_csv(hours: int = 168, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(hours=hours)
    rows = db.query(NetworkMetric).filter(
        NetworkMetric.timestamp >= start_date
    ).order_by(NetworkMetric.timestamp.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "test_id", "timestamp", "download_mbps", "upload_mbps",
        "latency_ms", "jitter_ms", "server_name", "server_location",
        "isp_name", "status"
    ])
    for r in rows:
        writer.writerow([
            r.test_id, r.timestamp, r.download_mbps, r.upload_mbps,
            r.latency_ms, r.jitter_ms, r.server_name, r.server_location,
            r.isp_name, r.status
        ])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=isp_eye_export.csv"}
    )

@app.post("/api/run-test")
async def trigger_test(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_speedtest)
    return {"message": "Speed test started in background"}

# ========================================
# REAL-TIME TRAFFIC MONITORING ENDPOINTS
# ========================================

def _capture_traffic_snapshot():
    """Capture current network connections, group by app, and save to DB."""
    try:
        import psutil
    except ImportError:
        return []

    app_data = {}

    # Get all active internet connections
    try:
        connections = psutil.net_connections(kind='inet')
    except psutil.AccessDenied:
        connections = []

    for conn in connections:
        if conn.pid and conn.pid > 0:
            try:
                proc = psutil.Process(conn.pid)
                name = proc.name()
                if name not in app_data:
                    app_data[name] = {"connections": 0, "bytes_sent": 0, "bytes_recv": 0}
                app_data[name]["connections"] += 1

                # Try to get process I/O counters (disk I/O as proxy on Windows)
                try:
                    io_info = proc.io_counters()
                    app_data[name]["bytes_sent"] += io_info.write_bytes
                    app_data[name]["bytes_recv"] += io_info.read_bytes
                except (psutil.AccessDenied, psutil.NoSuchProcess):
                    pass
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

    # Save snapshot to database
    db = next(get_db.__wrapped__()) if hasattr(get_db, '__wrapped__') else None
    from backend_api.database import SessionLocal
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        for app_name, data in app_data.items():
            log = AppTrafficLog(
                timestamp=now,
                app_name=app_name,
                bytes_sent=data["bytes_sent"],
                bytes_recv=data["bytes_recv"],
                connection_count=data["connections"]
            )
            db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving traffic snapshot: {e}")
    finally:
        db.close()

    return app_data


@app.get("/api/realtime-usage")
def get_realtime_usage():
    """Returns currently active network-connected processes."""
    try:
        import psutil
    except ImportError:
        return {"error": "psutil not installed"}

    app_data = {}
    try:
        connections = psutil.net_connections(kind='inet')
    except psutil.AccessDenied:
        return []

    for conn in connections:
        if conn.pid and conn.pid > 0:
            try:
                proc = psutil.Process(conn.pid)
                name = proc.name()
                if name not in app_data:
                    app_data[name] = {
                        "name": name,
                        "connections": 0,
                        "status_established": 0,
                        "status_other": 0,
                    }
                app_data[name]["connections"] += 1
                if conn.status == 'ESTABLISHED':
                    app_data[name]["status_established"] += 1
                else:
                    app_data[name]["status_other"] += 1
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

    result = sorted(app_data.values(), key=lambda x: x["connections"], reverse=True)
    return result


@app.post("/api/capture-traffic")
async def capture_traffic(background_tasks: BackgroundTasks):
    """Manually trigger a traffic snapshot that gets saved to the DB."""
    background_tasks.add_task(_capture_traffic_snapshot)
    return {"message": "Traffic snapshot captured"}


@app.get("/api/traffic-history")
def get_traffic_history(hours: int = 1, db: Session = Depends(get_db)):
    """Get historical app traffic data aggregated by app name."""
    start_date = datetime.utcnow() - timedelta(hours=hours)

    results = db.query(
        AppTrafficLog.app_name,
        func.sum(AppTrafficLog.bytes_recv).label("total_recv"),
        func.sum(AppTrafficLog.bytes_sent).label("total_sent"),
        func.sum(AppTrafficLog.connection_count).label("total_connections"),
        func.count(AppTrafficLog.id).label("snapshot_count"),
    ).filter(
        AppTrafficLog.timestamp >= start_date
    ).group_by(
        AppTrafficLog.app_name
    ).order_by(
        func.sum(AppTrafficLog.bytes_recv).desc()
    ).limit(15).all()

    return [
        {
            "app_name": r.app_name,
            "total_recv_mb": round(r.total_recv / (1024 * 1024), 2) if r.total_recv else 0,
            "total_sent_mb": round(r.total_sent / (1024 * 1024), 2) if r.total_sent else 0,
            "total_connections": r.total_connections,
            "snapshot_count": r.snapshot_count,
        } for r in results
    ]
