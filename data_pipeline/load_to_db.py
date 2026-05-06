import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api.database import SessionLocal, NetworkMetric

def insert_metric(download_mbps, upload_mbps, latency_ms, status,
                  jitter_ms=None, server_name=None, server_location=None, isp_name=None):
    db = SessionLocal()
    try:
        new_metric = NetworkMetric(
            timestamp=datetime.utcnow(),
            download_mbps=download_mbps,
            upload_mbps=upload_mbps,
            latency_ms=latency_ms,
            jitter_ms=jitter_ms,
            server_name=server_name,
            server_location=server_location,
            isp_name=isp_name,
            status=status
        )
        db.add(new_metric)
        db.commit()
        print(f"[{datetime.utcnow()}] Successfully inserted metric. Status: {status}")
    except Exception as e:
        db.rollback()
        print(f"Failed to insert metric: {e}")
    finally:
        db.close()
