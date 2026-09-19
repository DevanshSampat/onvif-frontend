import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Square, Sliders } from 'lucide-react';

export default function PTZPad({ onPTZMove, cameraConnected }) {
  const [speed, setSpeed] = useState(0.5);
  const [activeAction, setActiveAction] = useState(null);

  const handleCommand = async (action) => {
    if (!cameraConnected) return;
    setActiveAction(action);
    try {
      await onPTZMove(action, speed);
    } catch (err) {
      console.error('PTZ Command error:', err);
    } finally {
      setTimeout(() => setActiveAction(null), 300);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <span>PTZ Control Panel</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ONVIF Profile S</span>
      </div>

      {/* Speed Slider */}
      <div style={{ marginBottom: 20, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>Movement Speed</span>
          <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{Math.round(speed * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
      </div>

      {/* Direction Pad Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        maxWidth: 220,
        margin: '0 auto 20px',
        opacity: cameraConnected ? 1 : 0.4,
        pointerEvents: cameraConnected ? 'auto' : 'none'
      }}>
        {/* Top-Left */}
        <button
          className="btn btn-secondary"
          onClick={() => handleCommand('up-left')}
          style={{ padding: 12 }}
          title="Pan Up-Left"
        >
          <ChevronUp size={18} style={{ transform: 'rotate(-45deg)' }} />
        </button>

        {/* Up */}
        <button
          className={`btn ${activeAction === 'up' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('up')}
          style={{ padding: 12 }}
          title="Pan Up"
        >
          <ChevronUp size={20} />
        </button>

        {/* Top-Right */}
        <button
          className="btn btn-secondary"
          onClick={() => handleCommand('up-right')}
          style={{ padding: 12 }}
          title="Pan Up-Right"
        >
          <ChevronUp size={18} style={{ transform: 'rotate(45deg)' }} />
        </button>

        {/* Left */}
        <button
          className={`btn ${activeAction === 'left' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('left')}
          style={{ padding: 12 }}
          title="Pan Left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Center Stop */}
        <button
          className="btn btn-danger"
          onClick={() => handleCommand('stop')}
          style={{ padding: 12, borderRadius: '50%' }}
          title="Stop PTZ Movement"
        >
          <Square size={16} />
        </button>

        {/* Right */}
        <button
          className={`btn ${activeAction === 'right' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('right')}
          style={{ padding: 12 }}
          title="Pan Right"
        >
          <ChevronRight size={20} />
        </button>

        {/* Down-Left */}
        <button
          className="btn btn-secondary"
          onClick={() => handleCommand('down-left')}
          style={{ padding: 12 }}
          title="Pan Down-Left"
        >
          <ChevronDown size={18} style={{ transform: 'rotate(45deg)' }} />
        </button>

        {/* Down */}
        <button
          className={`btn ${activeAction === 'down' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('down')}
          style={{ padding: 12 }}
          title="Pan Down"
        >
          <ChevronDown size={20} />
        </button>

        {/* Down-Right */}
        <button
          className="btn btn-secondary"
          onClick={() => handleCommand('down-right')}
          style={{ padding: 12 }}
          title="Pan Down-Right"
        >
          <ChevronDown size={18} style={{ transform: 'rotate(-45deg)' }} />
        </button>
      </div>

      {/* Zoom Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        opacity: cameraConnected ? 1 : 0.4,
        pointerEvents: cameraConnected ? 'auto' : 'none'
      }}>
        <button
          className={`btn ${activeAction === 'zoom-in' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('zoom-in')}
        >
          <ZoomIn size={16} /> Zoom In
        </button>
        <button
          className={`btn ${activeAction === 'zoom-out' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCommand('zoom-out')}
        >
          <ZoomOut size={16} /> Zoom Out
        </button>
      </div>
    </div>
  );
}
