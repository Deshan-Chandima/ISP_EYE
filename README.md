# 👁️ ISP Eye - Automated Network Monitoring Solution

ISP Eye is a sophisticated, end-to-end Data Engineering pipeline designed to monitor, record, and visualize home internet performance. It provides real-time insights into network health, historical performance trends, and process-level traffic analysis.

---

## 🚀 Features

- **Automated Speed Testing**: Periodically captures Download, Upload, Latency, and Jitter.
- **Process Traffic Monitoring**: Real-time tracking of network usage per application (e.g., Chrome, Zoom, System).
- **Historical Analysis**: Beautifully visualized data across 24h, 7-day, and 30-day windows.
- **Outage Detection**: Automatic logging of connection failures for ISP reliability tracking.
- **Data Export**: Export your historical network data to CSV for external analysis.
- **Responsive Dashboard**: Modern UI with dark mode support, built for both desktop and mobile.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Modern, high-performance web framework.
- **Recharts**: For dynamic, interactive data visualization.
- **Lucide React**: Premium iconography.
- **Vanilla CSS**: Custom design system for a premium feel.

### Backend
- **FastAPI**: High-performance Python API framework.
- **SQLAlchemy**: ORM for robust database interactions.
- **Pydantic**: Data validation and serialization.
- **Psutil**: System-level network process monitoring.

### Data Pipeline
- **Speedtest CLI**: Industry-standard network performance measurement.
- **Python Automation**: Custom scripts for metric extraction and DB loading.

### Database
- **MySQL**: Relational database for long-term data persistence.

---

## 📂 Project Structure

```text
ISP Eye/
├── backend_api/          # FastAPI application & DB models
├── data_pipeline/        # Speedtest & ingestion logic
├── database/             # SQL schema definitions
├── frontend_dashboard/   # React/Vite frontend source
├── .env                  # Environment secrets (DO NOT COMMIT)
├── .gitignore            # Git ignore rules
└── requirements.txt      # Python dependencies
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Python 3.10+** installed.
- **Node.js 18+** installed.
- **MySQL Server** installed and running.

### 2. Database Configuration
1. Create a database named `network_monitor` in MySQL (or the name you prefer).
2. Run the initialization script:
   ```bash
   mysql -u root -p network_monitor < database/init_schema.sql
   ```
3. Configure your credentials in the `.env` file at the root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=network_monitor
   ```

### 3. Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate # Linux/Mac
   ```
2. Install Python dependencies (ensure `pymysql` is included in `requirements.txt`):
   ```bash
   pip install -r requirements.txt
   ```

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend_dashboard
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Start the Backend
From the root directory (with `venv` active):
```bash
uvicorn backend_api.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the Frontend
From the `frontend_dashboard` directory:
```bash
npm run dev
```

---

## 🤖 Automation (Windows Task Scheduler)

To capture metrics automatically every 30 minutes:
1. Open **Task Scheduler** and click **Create Task**.
2. **Trigger**: New -> Daily -> Repeat task every 30 minutes (Indefinitely).
3. **Action**: Start a program.
   - **Program**: Path to `venv\Scripts\python.exe`.
   - **Arguments**: `d:\Coding\Data E\ISP Eye\data_pipeline\extract_metrics.py`.
   - **Start in**: `d:\Coding\Data E\ISP Eye`.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/current-status` | GET | Latest network performance metrics. |
| `/api/historical-data` | GET | Aggregated data (daily summaries + raw). |
| `/api/realtime-usage` | GET | List of active apps consuming network. |
| `/api/run-test` | POST | Trigger a speed test manually. |
| `/api/export-csv` | GET | Download all historical data as CSV. |

---

## 👨‍💻 Author
**Deshan Chandima**
