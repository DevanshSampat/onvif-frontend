import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Square, Maximize, Volume2, VolumeX, Camera, AlertCircle, RefreshCw } from 'lucide-react';

export default function VideoPlayer({ streamUrl, isStreaming, onStartStream, onStopStream, snapshotUrl, cameraInfo }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toLocaleString());
  const [videoStats, setVideoStats] = useState({ width: 0, height: 0 });

  // Update OSD clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize HLS.js player when streamUrl changes or starts
  useEffect(() => {
    let hls = null;
    const video = videoRef.current;

    if (!video || !isStreaming || !streamUrl) {
      return;
    }

    setLoading(true);
    setError(null);

    const fullHlsUrl = streamUrl.startsWith('http')
      ? streamUrl
      : `http://localhost:5001${streamUrl}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 1,
        maxMaxBufferLength: 2,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 2,
        liveDurationInfinity: true,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 0,
      });

      hls.loadSource(fullHlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().then(() => setIsPlaying(true)).catch((e) => console.log('Autoplay prevented:', e));
      });

      // Force jump to live edge if video lags behind live edge or attempts to seek
      const forceLiveEdge = () => {
        if (video && hls && hls.liveSyncPosition) {
          if (Math.abs(video.currentTime - hls.liveSyncPosition) > 1.5) {
            video.currentTime = hls.liveSyncPosition;
          }
        }
      };

      video.addEventListener('seeking', forceLiveEdge);
      video.addEventListener('timeupdate', forceLiveEdge);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data.type);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error reading RTSP stream. Retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media stream decoding error. Recovering...');
              hls.recoverMediaError();
              break;
            default:
              setError('Stream connection lost. Please check RTSP URL or camera connection.');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        video.removeEventListener('seeking', forceLiveEdge);
        video.removeEventListener('timeupdate', forceLiveEdge);
        if (hls) {
          hls.destroy();
        }
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = fullHlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play();
      });
    } else {
      setError('HLS playback is not supported in this browser.');
    }
  }, [streamUrl, isStreaming]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoStats({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const captureCanvasSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Add timestamp watermark
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText(`CAM - ${currentTimeStr}`, 20, canvas.height - 20);

    const link = document.createElement('a');
    link.download = `cctv-snapshot-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 480, height: '100%' }}>
      {/* OSD Top Bar Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-red)', fontWeight: 700, letterSpacing: '1px' }}>● LIVE</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>|</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>
            {cameraInfo?.information?.Model || 'ONVIF IP CAMERA'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="font-mono">
          {videoStats.width > 0 && (
            <span style={{ background: 'rgba(0,210,255,0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }}>
              {videoStats.width}x{videoStats.height}
            </span>
          )}
          <span style={{ color: '#fff', opacity: 0.9 }}>{currentTimeStr}</span>
        </div>
      </div>

      {/* Main Screen Content */}
      <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {isStreaming ? (
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            muted={isMuted}
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Play size={32} color="var(--accent-cyan)" style={{ marginLeft: 4 }} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 8 }}>CCTV Video Stream Offline</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Click start live feed to transcode RTSP stream</p>
            <button className="btn btn-primary" onClick={onStartStream}>
              Start Stream
            </button>
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {loading && isStreaming && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}>
            <RefreshCw size={36} color="var(--accent-cyan)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Initializing HLS RTSP Stream...</span>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            textAlign: 'center'
          }}>
            <AlertCircle size={40} color="var(--accent-red)" />
            <h4 style={{ color: '#fff' }}>Stream Error</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 400 }}>{error}</p>
            <button className="btn btn-secondary" onClick={onStartStream} style={{ marginTop: 8 }}>
              Retry Stream
            </button>
          </div>
        )}
      </div>

      {/* Player Bottom Control Bar */}
      <div style={{
        padding: '12px 18px',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isStreaming ? (
            <button className="btn btn-danger" onClick={onStopStream} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Square size={14} /> Stop
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onStartStream} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Play size={14} /> Start
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => setIsMuted(!isMuted)}
            style={{ padding: '6px 10px' }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary" onClick={captureCanvasSnapshot} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Camera size={14} /> Snapshot
          </button>
          <button className="btn btn-secondary" onClick={toggleFullscreen} style={{ padding: '6px 10px' }}>
            <Maximize size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
