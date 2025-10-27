import { useState, useEffect } from 'react';
import { Map, Building2, MapPin, ZoomIn } from 'lucide-react';
import { supabase, AirportMap, Terminal } from '../lib/supabase';

interface AirportMapsProps {
  airportId: string;
  airportName: string;
}

export function AirportMaps({ airportId, airportName }: AirportMapsProps) {
  const [maps, setMaps] = useState<(AirportMap & { terminal?: Terminal })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState<AirportMap | null>(null);

  useEffect(() => {
    loadMaps();
  }, [airportId]);

  const loadMaps = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('airport_maps')
      .select('*, terminals:terminal_id(*)')
      .eq('airport_id', airportId)
      .order('map_type');

    if (!error && data) {
      const mapsWithTerminal = data.map((map: any) => ({
        ...map,
        terminal: map.terminals,
      }));
      setMaps(mapsWithTerminal);
    }

    setLoading(false);
  };

  const getMapTypeIcon = (type: string) => {
    switch (type) {
      case 'full_airport':
        return <Map className="w-5 h-5" />;
      case 'terminal':
        return <Building2 className="w-5 h-5" />;
      case 'parking':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Map className="w-5 h-5" />;
    }
  };

  const getMapTypeLabel = (type: string) => {
    switch (type) {
      case 'full_airport':
        return 'Airport Overview';
      case 'terminal':
        return 'Terminal Map';
      case 'parking':
        return 'Parking Map';
      default:
        return 'Map';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading maps...</p>
      </div>
    );
  }

  if (maps.length === 0) {
    return (
      <div className="text-center py-12">
        <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No maps available</h3>
        <p className="text-slate-600">Maps for this airport are coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Airport Maps & Floor Plans</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <div
            key={map.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
            onClick={() => setSelectedMap(map)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={map.map_url}
                alt={`${map.floor_level} map`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-2 text-white mb-1">
                  {getMapTypeIcon(map.map_type)}
                  <span className="text-sm font-medium">{getMapTypeLabel(map.map_type)}</span>
                </div>
                <h4 className="text-white font-bold text-lg">{map.floor_level}</h4>
                {map.terminal && (
                  <p className="text-white/90 text-sm">{map.terminal.name}</p>
                )}
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMap && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMap(null)}
        >
          <div className="relative max-w-6xl w-full bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedMap.floor_level}</h3>
                  <p className="text-sm text-slate-600">
                    {selectedMap.terminal?.name || airportName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMap(null)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              <img
                src={selectedMap.map_url}
                alt={`${selectedMap.floor_level} map`}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
