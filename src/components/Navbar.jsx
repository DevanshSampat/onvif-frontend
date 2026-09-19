import React from 'react';
import { Camera, RefreshCw, Radio, Settings, ShieldCheck } from 'lucide-react';

export default function Navbar({ cameraConnected, cameraInfo, onOpenConnectModal, isStreaming, onToggleStream }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'rgba(10, 13, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0088ff, #00d2ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)'
        }}>
          <Camera size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ONVIF CCTV Streamer
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={12} color="var(--accent-cyan)" />
            <span>Profile S / WS-Discovery Compatible</span>
          </div>
        </div>
      </div>

      {/* Connection & Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: 20 }}>
          <span className={`pulse-dot ${cameraConnected ? 'active' : ''}`} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {cameraConnected ? (cameraInfo?.information?.Manufacturer || 'Camera Connected') : 'Disconnected'}
          </span>
          {cameraInfo?.xaddr && (
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
              {cameraInfo.xaddr.replace(/^https?:\/\//, '').split('/')[0]}
            </span>
          )}
        </div>

        {cameraConnected && (
          <button
            className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
            onClick={onToggleStream}
          >
            <Radio size={16} className={isStreaming ? 'pulse' : ''} />
            {isStreaming ? 'Stop Live Feed' : 'Start Live Feed'}
          </button>
        )}

        <button className="btn btn-secondary" onClick={onOpenConnectModal}>
          <Settings size={16} />
          <span>{cameraConnected ? 'Change Camera' : 'Connect Camera'}</span>
        </button>
      </div>
    </header>
  );
}
