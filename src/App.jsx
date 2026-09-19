import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VideoPlayer from './components/VideoPlayer';
import PTZPad from './components/PTZPad';
import DeviceInfoCard from './components/DeviceInfoCard';
import ConnectModal from './components/ConnectModal';

const API_BASE = 'http://localhost:5001/api';

export default function App() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [currentCreds, setCurrentCreds] = useState({ user: '', pass: '' });

  // Auto-connect from localStorage on mount & check backend health
  useEffect(() => {
    const saved = localStorage.getItem('onvif_credentials');
    if (saved) {
      try {
        const creds = JSON.parse(saved);
        if (creds && (creds.xaddr || creds.customStreamUrl)) {
          handleConnectCamera(creds, false); // pass false so we don't re-save unnecessary duplicate
        }
      } catch (err) {
        console.error('Failed to parse saved credentials:', err);
      }
    }

    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stream && data.stream.active) {
          setIsStreaming(true);
          setStreamUrl(data.stream.info.playlistUrl);
        }
      })
      .catch((err) => console.log('Backend connection check failed:', err));
  }, []);

  // Handle network discovery trigger
  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      const res = await fetch(`${API_BASE}/discover`);
      const data = await res.json();
      if (data.success) {
        setDiscoveredDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Discovery failed:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Connect to ONVIF Camera
  const handleConnectCamera = async ({ xaddr, user, pass, streamUrl: customStreamUrl, information }, saveToStorage = true) => {
    setCurrentCreds({ user, pass });

    if (saveToStorage) {
      localStorage.setItem(
        'onvif_credentials',
        JSON.stringify({ xaddr, user, pass, customStreamUrl, information })
      );
    }

    if (customStreamUrl) {
      // Direct RTSP fallback connection
      const info = {
        xaddr,
        information: information || { Manufacturer: 'RTSP Camera', Model: 'IP Stream' },
        streamUrl: customStreamUrl,
      };
      setCameraInfo(info);
      setCameraConnected(true);
      await startStream(customStreamUrl);
      return;
    }

    const res = await fetch(`${API_BASE}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xaddr, user, pass }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Connection failed');
    }

    setCameraInfo(result.data);
    setCameraConnected(true);

    // Auto-start stream if streamUrl returned
    if (result.data.streamUrl) {
      await startStream(result.data.streamUrl);
    }
  };

  // Start HLS Transcode Stream
  const startStream = async (urlToStream) => {
    const targetUrl = urlToStream || cameraInfo?.streamUrl;
    if (!targetUrl) return;

    try {
      const res = await fetch(`${API_BASE}/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rtspUrl: targetUrl }),
      });

      const result = await res.json();
      if (result.success) {
        setStreamUrl(result.data.playlistUrl);
        setIsStreaming(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to start stream:', err);
      alert(`Stream start failed: ${err.message}`);
    }
  };

  // Stop Stream
  const stopStream = async () => {
    try {
      await fetch(`${API_BASE}/stream/stop`, { method: 'POST' });
    } catch (e) {
      console.error('Error stopping stream:', e);
    } finally {
      setIsStreaming(false);
    }
  };

  // Handle PTZ Movement
  const handlePTZMove = async (action, speed) => {
    if (!cameraInfo?.xaddr) return;

    const res = await fetch(`${API_BASE}/ptz/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xaddr: cameraInfo.xaddr,
        user: currentCreds.user,
        pass: currentCreds.pass,
        action,
        speed,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      console.error('PTZ Error:', result.error);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        cameraConnected={cameraConnected}
        cameraInfo={cameraInfo}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        isStreaming={isStreaming}
        onToggleStream={() => (isStreaming ? stopStream() : startStream())}
      />

      <main className="dashboard-grid">
        {/* Left Column: Video Feed */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <VideoPlayer
            streamUrl={streamUrl}
            isStreaming={isStreaming}
            onStartStream={() => startStream()}
            onStopStream={stopStream}
            snapshotUrl={cameraInfo?.snapshotUrl}
            cameraInfo={cameraInfo}
          />
        </section>

        {/* Right Column: Controls & Information */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <PTZPad
            onPTZMove={handlePTZMove}
            cameraConnected={cameraConnected}
          />
          <DeviceInfoCard cameraInfo={cameraInfo} />
        </aside>
      </main>

      {/* Connection Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectCamera}
        onDiscover={handleDiscover}
        discoveredDevices={discoveredDevices}
        isDiscovering={isDiscovering}
      />
    </div>
  );
}
