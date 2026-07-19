import React from 'react';
import { Server, MapPin, Globe } from 'lucide-react';

const ServerInfoCard = ({ currentStatus }) => {
  if (!currentStatus) return null;

  return (
    <div className="server-info-card">
      <div className="server-info-item">
        <div className="icon-wrapper server">
          <Server size={18} />
        </div>
        <div className="info-text">
          <span className="label">Test Server</span>
          <span className="value">{currentStatus.server_name || 'Unknown'}</span>
        </div>
      </div>

      <div className="divider"></div>

      <div className="server-info-item">
        <div className="icon-wrapper location">
          <MapPin size={18} />
        </div>
        <div className="info-text">
          <span className="label">Location</span>
          <span className="value">{currentStatus.server_location || 'Unknown'}</span>
        </div>
      </div>

      <div className="divider"></div>

      <div className="server-info-item">
        <div className="icon-wrapper isp">
          <Globe size={18} />
        </div>
        <div className="info-text">
          <span className="label">ISP</span>
          <span className="value">{currentStatus.isp_name || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default ServerInfoCard;
