import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import GlassmorphicCard from '../components/GlassmorphicCard';
import api from '../services/api';
import { Map, Zap, Layers, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const HeatmapDashboard = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHeatmapData = async () => {
    try {
      const response = await api.get('/heatmap');
      setHeatmapData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (colorStr) => {
    switch (colorStr) {
      case 'Red': return '#ef4444';
      case 'Orange': return '#f97316';
      case 'Yellow': return '#eab308';
      case 'Green': return '#22c55e';
      default: return '#3b82f6';
    }
  };

  const createHeatIcon = (station) => {
    // Dynamic size based on density
    const size = station.density > 80 ? 40 : station.density > 60 ? 28 : 18;
    const hex = getColor(station.color);
    
    return L.divIcon({
      className: 'clear-heat-icon',
      html: `
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          background-color: ${hex};
          opacity: 0.85;
          border-radius: 50%;
          box-shadow: 0 0 ${size}px ${size/4}px ${hex};
          animation: pulse ${station.density > 80 ? '1.5s' : '3s'} infinite alternate;
          pointer-events: none;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight gradient-text flex items-center gap-2">
          <Map className="text-rose-500" size={28} />
          Congestion Heatmap
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Dynamic visualization of station crowding levels.
        </p>
      </div>

      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <MapContainer 
          center={[28.6139, 77.2090]} 
          zoom={11} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {/* Heatmap Nodes */}
          {heatmapData.map((station) => (
            <Marker
              key={station.station_id}
              position={[station.lat, station.lng]}
              icon={createHeatIcon(station)}
            >
              <Tooltip className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white shadow-xl rounded-xl">
                <div className="p-2">
                  <h4 className="font-bold text-sm">{station.station_name}</h4>
                  <p className="text-xs text-slate-300">Crowd Density: <span className="font-black text-white">{station.density}%</span></p>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: getColor(station.color) }}>
                    {station.color} Level
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Subtle Map Overlay Gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20 z-[300]"></div>

        {/* Live Indicator Overlay */}
        <div className="absolute top-6 right-6 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white shadow-xl">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="absolute w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75"></span>
          </div>
          <span className="text-xs font-black tracking-widest text-red-400">LIVE</span>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-[400]">
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] text-white">
            <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2 text-slate-300">
              <Layers size={14} className="text-blue-400" /> Density Legend
            </h4>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_2px_#ef4444] animate-pulse"></div> Critical (&gt;80%)</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_2px_#f97316]"></div> High (60-80%)</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_2px_#eab308]"></div> Moderate (40-60%)</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_2px_#22c55e]"></div> Low (&lt;40%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapDashboard;
