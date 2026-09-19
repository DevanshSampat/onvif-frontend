import React, { useState } from 'react';
import { X, Search, Radio, Wifi, Lock, User, Server, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ConnectModal({ isOpen, onClose, onConnect, onDiscover, discoveredDevices, isDiscovering }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'discovery' | 'rtsp'
  const [ip, setIp] = useState('192.168.1.100');
  const [port, setPort] = useState('80');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [customRtspUrl, setCustomRtspUrl] = useState('rtsp://admin:password@192.168.1.100:554/h264/ch1/main/av_stream');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleManualConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const xaddr = `http://${ip}:${port}/onvif/device_service`;
    try {
      await onConnect({ xaddr, user, pass });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect to ONVIF camera');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiscovered = async (dev) => {
    setLoading(true);
    setError(null);
    try {
      await onConnect({ xaddr: dev.xaddr, user, pass });
      onClose();
    } catch (err) {
      setError(`Failed to connect to ${dev.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRtspConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConnect({
        xaddr: `rtsp://${ip}:${port}/custom`,
        streamUrl: customRtspUrl,
        information: { Manufacturer: 'Custom RTSP Camera', Model: 'Direct Stream', FirmwareVersion: '1.0' }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to initialize RTSP stream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 540, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={20} color="var(--accent-cyan)" />
            <span>Connect ONVIF CCTV Camera</span>
          </h2>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'manual' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'manual' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'manual' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            Manual IP / Auth
          </button>
          <button
            onClick={() => {
              setActiveTab('discovery');
              onDiscover();
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'discovery' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'discovery' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'discovery' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            Auto Discovery
          </button>
          <button
            onClick={() => setActiveTab('rtsp')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'rtsp' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'rtsp' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'rtsp' ? '2px solid var(--accent-cyan)' : 'none'
            }}
          >
            Direct RTSP
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24 }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: 16,
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualConnect}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Camera IP Address</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="192.168.1.100"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">ONVIF Port</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="80 or 8000"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="admin"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Camera password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: 8 }}
              >
                {loading ? <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={16} />}
                <span>{loading ? 'Connecting...' : 'Connect to Camera'}</span>
              </button>
            </form>
          )}

          {/* Discovery Tab */}
          {activeTab === 'discovery' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  WS-Discovery probes on local network
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={onDiscover}
                  disabled={isDiscovering}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Search size={14} /> Scan Again
                </button>
              </div>

              {isDiscovering ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  <RefreshCw size={28} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                  <p style={{ fontSize: '0.85rem' }}>Scanning local network for ONVIF devices...</p>
                </div>
              ) : discoveredDevices && discoveredDevices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                  {discoveredDevices.map((dev, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectDiscovered(dev)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{dev.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.xaddr}</div>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <Wifi size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                  <p style={{ fontSize: '0.85rem' }}>No ONVIF devices responded to auto-discovery.</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Try the <b>Manual IP</b> tab if your camera uses a custom subnet or port.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Direct RTSP Tab */}
          {activeTab === 'rtsp' && (
            <form onSubmit={handleCustomRtspConnect}>
              <div className="input-group">
                <label className="input-label">RTSP Stream URL</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="rtsp://user:pass@192.168.1.100:554/stream1"
                  value={customRtspUrl}
                  onChange={(e) => setCustomRtspUrl(e.target.value)}
                  required
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Directly stream RTSP feed (e.g. Hikvision, Dahua, Reolink, RTSP IP cameras).
              </p>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={16} />}
                <span>Start Direct RTSP Feed</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
