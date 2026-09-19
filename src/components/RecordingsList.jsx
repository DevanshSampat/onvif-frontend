import React, { useState, useEffect } from 'react';
import { Video, Download, RefreshCw, Film, Clock, HardDrive } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function RecordingsList() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recordings`);
      const data = await res.json();
      if (data.success) {
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      console.error('Failed to fetch recordings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
    // Poll dynamically every 5 minutes (matching streams cleanup interval)
    const interval = setInterval(fetchRecordings, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (rec) => {
    const downloadUrl = `http://localhost:5001${rec.downloadUrl}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = rec.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={18} color="var(--accent-cyan)" />
            <span>CCTV Stream Recordings</span>
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Separate from video index • 5-min auto-refresh • 24h retention
          </span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchRecordings}
          disabled={loading}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Video Modal / Preview */}
      {selectedRecording && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 800, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ color: '#fff', fontSize: '1rem' }}>Playback: {selectedRecording.filename}</h4>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedRecording(null)}
                style={{ padding: '4px 10px' }}
              >
                ✕ Close
              </button>
            </div>
            <video
              src={`http://localhost:5001${selectedRecording.streamUrl || selectedRecording.playUrl}`}
              controls
              autoPlay
              style={{ width: '100%', maxHeight: 480, borderRadius: 'var(--radius-sm)', background: '#000' }}
            />
          </div>
        </div>
      )}

      {recordings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
          <Clock size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
          <p style={{ fontSize: '0.85rem' }}>No recordings saved yet.</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Recordings save in 10-minute MP4 intervals and refresh every 5 minutes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
          {recordings.map((rec, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="font-mono" style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                  {rec.filename}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HardDrive size={12} /> {rec.sizeMB} MB
                  </span>
                  <span>|</span>
                  <span>{new Date(rec.modifiedAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecording(rec)}
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                >
                  <Video size={14} /> Play
                </button>
                <button
                  onClick={() => handleDownload(rec)}
                  className="btn btn-primary"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
