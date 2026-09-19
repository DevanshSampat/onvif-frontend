import React from 'react';
import { Info, Cpu, HardDrive, Hash, Video } from 'lucide-react';

export default function DeviceInfoCard({ cameraInfo }) {
  if (!cameraInfo || !cameraInfo.information) {
    return (
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={18} color="var(--accent-cyan)" />
          <span>Device Metadata</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No ONVIF camera connected yet. Use "Connect Camera" to discover or link a camera.
        </p>
      </div>
    );
  }

  const { Manufacturer, Model, FirmwareVersion, SerialNumber, HardwareId } = cameraInfo.information;

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Info size={18} color="var(--accent-cyan)" />
        <span>Camera Device Metadata</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={14} color="var(--accent-blue)" /> Manufacturer
          </span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{Manufacturer || 'N/A'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Video size={14} color="var(--accent-cyan)" /> Model
          </span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{Model || 'N/A'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HardDrive size={14} color="var(--accent-green)" /> Firmware
          </span>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{FirmwareVersion || 'N/A'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={14} color="var(--accent-amber)" /> Serial No.
          </span>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{SerialNumber || 'N/A'}</span>
        </div>

        {cameraInfo.streamUrl && (
          <div style={{ marginTop: 4 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
              RTSP Stream Endpoint
            </span>
            <div className="font-mono" style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 10px',
              borderRadius: 6,
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              wordBreak: 'break-all',
              border: '1px solid var(--border-color)'
            }}>
              {cameraInfo.streamUrl.replace(/:[^:@]+@/, ':****@')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
