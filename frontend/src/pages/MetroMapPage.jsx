import React, { useEffect, useState } from 'react';
import { useWebSockets } from '../context/WebSocketContext';
import LeafletMap from '../components/LeafletMap';
import GlassmorphicCard from '../components/GlassmorphicCard';
import api from '../services/api';
import { Train, Info, ShieldAlert, MapPin } from 'lucide-react';

const MetroMapPage = () => {
  const { realTimeData } = useWebSockets();
  const [networkCount, setNetworkCount] = useState({ stations: 285, lines: 13 });
  const [activeTab, setActiveTab] = useState('overview'); // overview, alerts, trains

  useEffect(() => {
    api.get('/stations/network-map')
      .then(res => {
        const stns = res.data.stations || [];
        const lineSet = new Set(stns.map(s => s.line));
        setNetworkCount({ stations: stns.length, lines: lineSet.size });
      })
      .catch(() => {});
  }, []);

  const stations = realTimeData?.stations || [];
  const trains = realTimeData?.trains || [];

  const overcrowdedStations = stations.filter(s => s.crowd_level === 'Red');
  const activeTrainsCount = trains.filter(t => t.status === 'In Service').length;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight gradient-text">System Interactive Map</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Live tracking of metro lines, stations crowd density, and rolling stock positions.
        </p>
      </div>

      {/* Main Grid: Map + Side Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Leaflet Map (Takes 3/4 width on desktop) */}
        <div className="lg:col-span-3 h-full">
          <LeafletMap stationsData={stations} trainsData={trains} />
        </div>

        {/* Side Panel (Takes 1/4 width on desktop) */}
        <div className="flex flex-col h-full min-h-0">
          <GlassmorphicCard className="flex flex-col h-full min-h-0 space-y-4" hoverEffect={false}>
            {/* Tab Navigation */}
            <div className="flex p-1 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 rounded-xl">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-500 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'alerts' ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-500 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Alerts {overcrowdedStations.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{overcrowdedStations.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('trains')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'trains' ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-500 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Trains ({trains.length})
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 min-h-0 flex flex-col">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4 overflow-y-auto pr-1">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    <span>Map Overview</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-xl space-y-1">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={10} />Real Stations</span>
                      <p className="text-lg font-black">{networkCount.stations}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-xl space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Metro Lines</span>
                      <p className="text-lg font-black text-purple-500">{networkCount.lines}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Active Trains</span>
                      <p className="text-lg font-black text-blue-500">{activeTrainsCount}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Live Stations</span>
                      <p className="text-lg font-black text-green-500">{stations.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div className="flex flex-col h-full min-h-0 gap-3">
                  <h3 className="font-bold text-base flex items-center gap-2 text-red-500">
                    <ShieldAlert size={18} />
                    <span>Overcrowded Stations ({overcrowdedStations.length})</span>
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 pb-2">
                    {overcrowdedStations.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-500">
                        No overcrowding warnings at present.
                      </div>
                    ) : (
                      overcrowdedStations.map((station) => (
                        <div 
                          key={station.station_id} 
                          className="p-3 rounded-xl border border-red-500/20 border-l-2 border-l-red-500 bg-red-500/5 flex items-center justify-between text-xs transition-all hover:scale-[1.02]"
                        >
                          <div>
                            <h4 className="font-bold text-red-700 dark:text-red-200">{station.name}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{station.line}</p>
                          </div>
                          <div className="text-right font-bold">
                            <p className="text-red-600 dark:text-red-400">{station.passenger_count} pax</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{station.crowd_percentage}% cap</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Trains Tab */}
              {activeTab === 'trains' && (
                <div className="flex flex-col h-full min-h-0 gap-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Train size={18} className="text-blue-500" />
                    <span>Active Trains ({trains.length})</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 pb-2">
                    {trains.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-500">
                        No trains currently in service.
                      </div>
                    ) : (
                      trains.map((train) => (
                        <div 
                          key={train.train_id} 
                           className="p-3 rounded-xl border border-[var(--border)] bg-slate-200/20 dark:bg-slate-800/20 flex flex-col gap-1.5 text-xs transition-all hover:scale-[1.02]"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold">{train.train_number}</h4>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              train.crowd_level === 'Red'
                                ? 'badge-gradient-red'
                                : train.crowd_level === 'Orange'
                                ? 'badge-gradient-amber'
                                : train.crowd_level === 'Yellow'
                                ? 'badge-gradient-amber'
                                : 'badge-gradient-emerald'
                            }`}>
                              {train.crowd_level}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{train.train_name}</span>
                            <span>At: <b className="text-slate-800 dark:text-white">{train.current_station}</b></span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default MetroMapPage;
