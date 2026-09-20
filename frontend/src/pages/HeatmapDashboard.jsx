import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { Map as MapIcon, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/*
 * Get heatmap color from density level.
 */
const getColor = (colorStr) => {
  switch (colorStr) {
    case 'Red':
      return '#ef4444';

    case 'Orange':
      return '#f97316';

    case 'Yellow':
      return '#eab308';

    case 'Green':
      return '#22c55e';

    default:
      return '#3b82f6';
  }
};

/*
 * Leaflet icon cache.
 *
 * Instead of creating a new DOM icon for every station,
 * we reuse icons with the same size/color combination.
 */
const iconCache = new Map();

/*
 * Create/reuse heatmap station icon.
 */
const createHeatIcon = (station) => {
  const density = Number(station.density) || 0;

  const size =
    density > 80
      ? 40
      : density > 60
        ? 28
        : 18;

  const color = station.color || 'Green';
  const hex = getColor(color);

  const cacheKey = `${size}-${color}`;

  /*
   * Return cached icon if it already exists.
   */
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  const icon = L.divIcon({
    className: 'clear-heat-icon',

    html: `
      <div
        style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${hex};
          opacity: 0.85;
          border-radius: 50%;
          box-shadow:
            0 0 ${Math.round(size * 0.7)}px
            ${Math.round(size * 0.2)}px
            ${hex};
          pointer-events: none;
        "
      ></div>
    `,

    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  /*
   * Store icon for future reuse.
   */
  iconCache.set(cacheKey, icon);

  return icon;
};


/*
 * Individual station marker.
 *
 * React.memo prevents unnecessary re-rendering when
 * unrelated parts of the dashboard change.
 */
const StationMarker = React.memo(({ station }) => {

  /*
   * Convert coordinates only when they actually change.
   */
  const position = useMemo(
    () => [
      Number(station.lat),
      Number(station.lng),
    ],
    [station.lat, station.lng]
  );

  /*
   * Reuse cached Leaflet icon.
   */
  const icon = useMemo(
    () => createHeatIcon(station),
    [station.density, station.color]
  );

  const color = getColor(station.color);

  return (
    <Marker
      position={position}
      icon={icon}
    >
      <Tooltip>
        <div className="p-2">

          <h4 className="font-bold text-sm">
            {station.station_name}
          </h4>

          <p className="text-xs text-slate-300">
            Crowd Density:{' '}
            <span className="font-black text-white">
              {station.density}%
            </span>
          </p>

          <p
            className="text-[10px] uppercase font-bold tracking-wider mt-1"
            style={{ color }}
          >
            {station.color} Level
          </p>

        </div>
      </Tooltip>
    </Marker>
  );
});


const HeatmapDashboard = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);


  /*
   * Fetch heatmap data from backend.
   */
  const fetchHeatmapData = async () => {
    try {

      const response = await api.get('/heatmap');

      const newData = response.data?.data || [];

      /*
       * Only update state when the actual station
       * information has changed.
       */
      setHeatmapData((previousData) => {

        /*
         * Different number of stations.
         */
        if (previousData.length !== newData.length) {
          return newData;
        }

        /*
         * Check whether any station changed.
         */
        const changed = newData.some((station, index) => {

          const previous = previousData[index];

          if (!previous) {
            return true;
          }

          return (
            previous.station_id !== station.station_id ||
            previous.lat !== station.lat ||
            previous.lng !== station.lng ||
            previous.density !== station.density ||
            previous.color !== station.color ||
            previous.station_name !== station.station_name
          );
        });

        /*
         * Don't trigger a React update if nothing changed.
         */
        return changed
          ? newData
          : previousData;
      });

    } catch (error) {

      console.error(
        'Failed to fetch heatmap data:',
        error
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * Initial fetch + live refresh.
   */
  useEffect(() => {

    /*
     * Load immediately.
     */
    fetchHeatmapData();

    /*
     * Refresh every 10 seconds.
     *
     * This is lighter than refreshing every 5 seconds.
     */
    const interval = setInterval(
      fetchHeatmapData,
      10000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  /*
   * Remove stations with invalid coordinates.
   */
  const validStations = useMemo(() => {

    return heatmapData.filter(
      (station) =>
        Number.isFinite(Number(station.lat)) &&
        Number.isFinite(Number(station.lng))
    );

  }, [heatmapData]);


  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">

      {/* ================= HEADER ================= */}

      <div>

        <h1 className="text-3xl font-black tracking-tight gradient-text flex items-center gap-2">

          {/* IMPORTANT:
              Use MapIcon, NOT Map.
              Map is the native JavaScript Map constructor.
          */}
          <MapIcon
            className="text-rose-500"
            size={28}
          />

          Congestion Heatmap

        </h1>

        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Dynamic visualization of station crowding levels.
        </p>

      </div>


      {/* ================= MAP CONTAINER ================= */}

      <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">

        {/* ================= LOADING ================= */}

        {loading && (

          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">

            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />

          </div>

        )}


        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          preferCanvas={true}
          style={{
            height: '100%',
            width: '100%',
            background: '#0f172a',
          }}
        >

          {/* ================= OPENSTREETMAP ================= */}

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />


          {/* ================= HEATMAP STATIONS ================= */}

          {validStations.map((station) => (

            <StationMarker
              key={station.station_id}
              station={station}
            />

          ))}

        </MapContainer>


        {/* ================= MAP GRADIENT ================= */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
            bg-gradient-to-t
            from-slate-900/80
            via-transparent
            to-slate-900/20
            z-[300]
          "
        />


        {/* ================= LIVE INDICATOR ================= */}

        <div
          className="
            absolute
            top-6
            right-6
            z-[400]
            flex
            items-center
            gap-2
            px-3
            py-1.5
            rounded-full
            bg-slate-900/80
            backdrop-blur-md
            border
            border-slate-700
            text-white
            shadow-xl
          "
        >

          <div className="relative flex items-center justify-center">

            <span className="w-2 h-2 rounded-full bg-red-500" />

            <span className="absolute w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75" />

          </div>

          <span className="text-xs font-black tracking-widest text-red-400">
            LIVE
          </span>

        </div>


        {/* ================= LEGEND ================= */}

        <div className="absolute bottom-6 left-6 z-[400]">

          <div
            className="
              p-4
              rounded-2xl
              bg-slate-900/80
              backdrop-blur-xl
              border
              border-slate-700
              shadow-[0_8px_30px_rgb(0,0,0,0.5)]
              text-white
            "
          >

            <h4
              className="
                text-xs
                font-black
                uppercase
                mb-3
                flex
                items-center
                gap-2
                text-slate-300
              "
            >

              <Layers
                size={14}
                className="text-blue-400"
              />

              Density Legend

            </h4>


            <div className="space-y-3 text-xs font-semibold">

              {/* Critical */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-red-500
                    shadow-[0_0_8px_2px_#ef4444]
                    animate-pulse
                  "
                />

                Critical (&gt;80%)

              </div>


              {/* High */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-orange-500
                    shadow-[0_0_8px_2px_#f97316]
                  "
                />

                High (60-80%)

              </div>


              {/* Moderate */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-yellow-500
                    shadow-[0_0_8px_2px_#eab308]
                  "
                />

                Moderate (40-60%)

              </div>


              {/* Low */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-3
                    h-3
                    rounded-full
                    bg-green-500
                    shadow-[0_0_8px_2px_#22c55e]
                  "
                />

                Low (&lt;40%)

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HeatmapDashboard;