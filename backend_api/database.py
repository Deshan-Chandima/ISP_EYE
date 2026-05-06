import os
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from the root .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "network_monitor")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class NetworkMetric(Base):
    __tablename__ = "network_metrics"

    test_id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    download_mbps = Column(Float, nullable=True)
    upload_mbps = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    jitter_ms = Column(Float, nullable=True)
    server_name = Column(String(100), nullable=True)
    server_location = Column(String(100), nullable=True)
    isp_name = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False)

class AppTrafficLog(Base):
    __tablename__ = "app_traffic_log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    app_name = Column(String(100), nullable=False)
    bytes_sent = Column(Float, default=0)
    bytes_recv = Column(Float, default=0)
    connection_count = Column(Integer, default=0)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
