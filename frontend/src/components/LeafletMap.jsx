import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real metro line colors — matches backend LINE_COLORS_MAP
const LINE_COLORS = {
  "Red line":          "#ef4444",
  "Yellow line":       "#eab308",
  "Blue line":         "#3b82f6",
  "Pink line":         "#ec4899",
  "Magenta line":      "#d946ef",
  "Voilet line":       "#8b5cf6",
  "Violet line":       "#8b5cf6",
  "Green line":        "#22c55e",
  "Green line branch": "#16a34a",
  "Aqua line":         "#06b6d4",
  "Rapid Metro":       "#64748b",
  "Gray line":         "#9ca3af",
  "Orange line":       "#f97316",
  "Blue line branch":  "#60a5fa",
};

// Create a glowing dot icon for real network stations (smaller, elegant)
const createNetworkStationIcon = (lineColor, layout) => {
  const isElevated = layout?.toLowerCase().includes('elevated');
  return L.divIcon({
    className: 'network-station-icon',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="
          width: ${isElevated ? '9px' : '11px'};
          height: ${isElevated ? '9px' : '11px'};
          border-radius: 50%;
          background: ${lineColor};
          border: 2px solid rgba(255,255,255,0.85);
          box-shadow: 0 0 6px ${lineColor}99;
        "></div>
      </div>
    `,
    iconSize: [11, 11],
    iconAnchor: [5, 5],
  });
};

// Create crowd-level glowing marker for live WebSocket stations
const createLiveStationIcon = (color) => {
  const colorMap = {
    Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Red: '#ef4444',
  };
  const hex = colorMap[color] || '#3b82f6';

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
          style="background-color: ${hex};"></div>
        <div class="absolute w-6 h-6 rounded-full opacity-40 animate-ping"
          style="background-color: ${hex};"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Train icon
const createTrainIcon = (color) => {
  const colorMap = {
    Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Red: '#ef4444',
  };
  const hex = colorMap[color] || '#3b82f6';

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-xl bg-slate-900 border border-slate-700 shadow-lg text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="${hex}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 3h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
            <path d="M4 10h16v8H4z"/><path d="M12 18v4"/>
            <path d="m8 22 1-4"/><path d="m16 22-1-4"/><path d="M8 6h8"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const LeafletMap = ({ stationsData = [], trainsData = [] }) => {
  const [networkStations, setNetworkStations] = useState([]);
  const [showNetworkLayer, setShowNetworkLayer] = useState(true);
  const delhiCenter = [28.6139, 77.2090];

  // Fetch real station coordinates from Delhi-Metro-Network.csv via API
  useEffect(() => {
    const fetchNetworkMap = async () => {
      try {
        const res = await api.get('/stations/network-map');
        setNetworkStations(res.data.stations || []);
      } catch (err) {
        console.error('Could not load network map stations:', err);
      }
    };
    fetchNetworkMap();
  }, []);

  // Group real network stations by line and draw polylines
  const renderNetworkPolylines = () => {
    const lines = {};
    networkStations.forEach(s => {
      if (!lines[s.line]) lines[s.line] = [];
      lines[s.line].push(s);
    });

    return Object.entries(lines).map(([lineName, stations]) => {
      // Sort by distance_from_start_km to get correct ordering
      const sorted = [...stations].sort((a, b) => a.distance_from_start_km - b.distance_from_start_km);
      const positions = sorted.map(s => [s.latitude, s.longitude]);
      if (positions.length < 2) return null;

      const strokeColor = LINE_COLORS[lineName] || '#6366f1';

      return (
        <Polyline
          key={`net-${lineName}`}
          positions={positions}
          pathOptions={{
            color: strokeColor,
            weight: 3.5,
            opacity: 0.8,
            dashArray: lineName === 'Rapid Metro' ? '5 7' : undefined,
          }}
        />
      );
    });
  };

  // Live stations polylines (for WebSocket crowd data overlay)
  const renderLivePolylines = () => {
    const lines = {};
    stationsData.forEach(s => {
      if (!lines[s.line]) lines[s.line] = [];
      lines[s.line].push(s);
    });

    return Object.entries(lines).map(([lineName, stations]) => {
      const sorted = [...stations].sort((a, b) => (a.latitude || 0) - (b.latitude || 0));
      const positions = sorted.map(s => [s.latitude, s.longitude]);
      if (positions.length < 2) return null;
      const strokeColor = LINE_COLORS[lineName] || '#6366f1';
      return (
        <Polyline
          key={`live-${lineName}`}
          positions={positions}
          pathOptions={{ color: strokeColor, weight: 3.5, opacity: 0.85 }}
        />
      );
    });
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 relative shadow-xl">

      {/* Layer toggle button */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <button
          onClick={() => setShowNetworkLayer(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border transition-all ${
            showNetworkLayer
              ? 'bg-slate-900 border-slate-600 text-white'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
          }`}
        >
          {showNetworkLayer ? '🗺 Network ON' : '🗺 Network OFF'}
        </button>
      </div>

      {/* Station count badge */}
      {networkStations.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-lg bg-slate-900/85 border border-slate-700 text-white text-xs font-bold shadow-lg">
          📍 {networkStations.length} Real Stations · {Object.keys(
            networkStations.reduce((acc, s) => { acc[s.line] = 1; return acc; }, {})
          ).length} Lines
        </div>
      )}

      <MapContainer
        center={delhiCenter}
        zoom={11.5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Carto tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* ── Real Network Layer (from Delhi-Metro-Network.csv) ── */}
        {showNetworkLayer && (
          <LayerGroup>
            {renderNetworkPolylines()}
            {networkStations.map(station => (
              <Marker
                key={`net-${station.id}`}
                position={[station.latitude, station.longitude]}
                icon={createNetworkStationIcon(station.line_color, station.station_layout)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-44 text-slate-900 dark:text-slate-100">
                    <h4 className="font-bold text-sm border-b pb-1 mb-1.5 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: station.line_color }}
                      />
                      {station.name}
                    </h4>
                    <p className="text-xs text-slate-500 mb-1">
                      <b>Line:</b> {station.line}
                    </p>
                    <p className="text-xs text-slate-500 mb-1">
                      <b>Layout:</b> {station.station_layout}
                    </p>
                    <p className="text-xs text-slate-500 mb-1">
                      <b>Opened:</b> {station.opening_date}
                    </p>
                    <p className="text-xs text-slate-500">
                      <b>Distance:</b> {station.distance_from_start_km} km from start
                    </p>
                    <div className="mt-2 pt-2 border-t flex justify-between text-[10px]">
                      <span className="text-slate-500">
                        {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        {/* ── Live WebSocket Station Overlay (crowd data) ── */}
        {stationsData.length > 0 && (
          <LayerGroup>
            {stationsData.map(station => (
              <Marker
                key={`live-${station.station_id || station.id}`}
                position={[station.latitude, station.longitude]}
                icon={createLiveStationIcon(station.crowd_level || 'Green')}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-40 text-slate-900 dark:text-slate-100">
                    <h4 className="font-bold text-sm border-b pb-1 mb-1.5 flex justify-between items-center">
                      <span>{station.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        station.crowd_level === 'Red'    ? 'bg-red-500/10 text-red-600'
                        : station.crowd_level === 'Orange' ? 'bg-orange-500/10 text-orange-600'
                        : station.crowd_level === 'Yellow' ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-green-500/10 text-green-600'
                      }`}>
                        {station.crowd_level}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <b>Line:</b> {station.line}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-[11px] font-semibold">
                      <div>
                        <p className="opacity-65 dark:opacity-100">Riders</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{station.passenger_count}</p>
                      </div>
                      <div>
                        <p className="opacity-65 dark:opacity-100">Density</p>
                        <p className="text-sm font-bold">{station.crowd_percentage}%</p>
                      </div>
                      <div>
                        <p className="opacity-65 dark:opacity-100">Inflow</p>
                        <p className="text-green-500 font-bold">+{station.inflow}</p>
                      </div>
                      <div>
                        <p className="opacity-65 dark:opacity-100">Outflow</p>
                        <p className="text-red-500 font-bold">-{station.outflow}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        {/* ── Live Moving Trains ── */}
        {trainsData.map(train => (
          <Marker
            key={train.train_id}
            position={[train.latitude, train.longitude]}
            icon={createTrainIcon(train.crowd_level || 'Green')}
          >
            <Popup>
              <div className="p-2 min-w-44 text-slate-900 dark:text-slate-100">
                <h4 className="font-bold text-sm border-b pb-1 mb-1 flex justify-between items-center">
                  <span>{train.train_number}</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{train.status}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  <b>Name:</b> {train.train_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <b>At Station:</b> {train.current_station}
                </p>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Occupancy:</span>
                    <span className="font-bold">
                      {train.current_occupancy} / {train.capacity} ({train.occupancy_percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        train.crowd_level === 'Red'    ? 'bg-red-500'
                        : train.crowd_level === 'Orange' ? 'bg-orange-500'
                        : train.crowd_level === 'Yellow' ? 'bg-yellow-500'
                        : 'bg-green-500'
                      }`}
                      style={{ width: `${train.occupancy_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
