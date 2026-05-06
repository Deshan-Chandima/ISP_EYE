import speedtest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_pipeline.load_to_db import insert_metric

def run_speedtest():
    print("Starting speed test...")
    try:
        st = speedtest.Speedtest()
        st.get_best_server()

        print("Testing download speed...")
        download_speed = st.download() / 1_000_000  # Convert to Mbps

        print("Testing upload speed...")
        upload_speed = st.upload() / 1_000_000      # Convert to Mbps

        latency = st.results.ping

        # Extract additional metadata from the speedtest results
        server_info = st.results.server
        server_name = server_info.get("sponsor", "Unknown")
        server_location = f"{server_info.get('name', '')}, {server_info.get('country', '')}"
        isp_name = st.results.client.get("isp", "Unknown")

        # Calculate jitter from the ping values if available
        # speedtest-cli doesn't directly expose jitter, so we approximate it
        # by using the server's latency value
        jitter = server_info.get("latency", 0) - latency if server_info.get("latency") else None

        print(f"Download: {download_speed:.2f} Mbps | Upload: {upload_speed:.2f} Mbps | Ping: {latency} ms")
        print(f"Server: {server_name} ({server_location}) | ISP: {isp_name}")

        insert_metric(
            download_mbps=round(download_speed, 2),
            upload_mbps=round(upload_speed, 2),
            latency_ms=round(latency, 2),
            jitter_ms=round(abs(jitter), 2) if jitter is not None else None,
            server_name=server_name,
            server_location=server_location,
            isp_name=isp_name,
            status="SUCCESS"
        )
    except speedtest.ConfigRetrievalError:
        print("Error: Could not retrieve speedtest configuration. Network might be down.")
        insert_metric(download_mbps=0, upload_mbps=0, latency_ms=0, status="FAILED")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        insert_metric(download_mbps=0, upload_mbps=0, latency_ms=0, status="FAILED")

if __name__ == "__main__":
    run_speedtest()
