import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchCurrentStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/current-status`);
        return response.data;
    } catch (error) {
        console.error("Error fetching current status:", error);
        throw error;
    }
};

export const fetchHistoricalData = async (hours = 24) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/historical-data?hours=${hours}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching historical data:", error);
        throw error;
    }
};

export const fetchOutages = async (hours = 168) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/outages?hours=${hours}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching outages:", error);
        throw error;
    }
};

export const runSpeedTest = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/run-test`);
        return response.data;
    } catch (error) {
        console.error("Error triggering speed test:", error);
        throw error;
    }
};

export const fetchRealtimeUsage = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/realtime-usage`);
        return response.data;
    } catch (error) {
        console.error("Error fetching realtime usage:", error);
        throw error;
    }
};

export const captureTrafficSnapshot = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/capture-traffic`);
        return response.data;
    } catch (error) {
        console.error("Error capturing traffic:", error);
        throw error;
    }
};

export const fetchTrafficHistory = async (hours = 1) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/traffic-history?hours=${hours}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching traffic history:", error);
        throw error;
    }
};

export const getExportUrl = (hours = 168) => {
    return `${API_BASE_URL}/export-csv?hours=${hours}`;
};
