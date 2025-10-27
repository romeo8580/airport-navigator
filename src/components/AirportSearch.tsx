import { useState, useEffect } from 'react';
import { Search, MapPin, Plane, Clock, ChevronRight, Map as MapIcon, Coffee } from 'lucide-react';
import { supabase, Airport, Terminal, Flight } from '../lib/supabase';
import { AirportMaps } from './AirportMaps';
import { AirportLounges } from './AirportLounges';

export function AirportSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'maps' | 'lounges'>('overview');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAirports(airports);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = airports.filter(
        (airport) =>
          airport.name.toLowerCase().includes(query) ||
          airport.code.toLowerCase().includes(query) ||
          airport.city.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
      );
      setFilteredAirports(filtered);
    }
  }, [searchQuery, airports]);

  const loadAirports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .order('name');

    if (!error && data) {
      setAirports(data);
      setFilteredAirports(data);
    }
    setLoading(false);
  };

  const selectAirport = async (airport: Airport) => {
    setSelectedAirport(airport);
    setLoading(true);

    const [terminalsResult, flightsResult] = await Promise.all([
      supabase
        .from('terminals')
        .select('*')
        .eq('airport_id', airport.id)
        .order('name'),
      supabase
        .from('flights')
        .select('*')
        .eq('airport_id', airport.id)
        .order('departure_time')
        .limit(10),
    ]);

    if (!terminalsResult.error && terminalsResult.data) {
      setTerminals(terminalsResult.data);
    }

    if (!flightsResult.error && flightsResult.data) {
      setFlights(flightsResult.data);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600 bg-green-50';
      case 'delayed':
        return 'text-orange-600 bg-orange-50';
      case 'boarding':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Find an Airport</h2>
        <p className="text-slate-600">
          Search for airports by name, code, city, or country
        </p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search airports (e.g., JFK, Los Angeles, London)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {!selectedAirport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-600">
              Loading airports...
            </div>
          ) : filteredAirports.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-600">
              No airports found matching your search.
            </div>
          ) : (
            filteredAirports.map((airport) => (
              <button
                key={airport.id}
                onClick={() => selectAirport(airport)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-blue-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-blue-600">
                        {airport.code}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {airport.name}
                </h3>
                <div className="flex items-center text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {airport.city}, {airport.country}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <button
              onClick={() => {
                setSelectedAirport(null);
                setTerminals([]);
                setFlights([]);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
            >
              ← Back to search
            </button>

            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {selectedAirport.code}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedAirport.name}
                </h2>
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedAirport.city}, {selectedAirport.country}
                </div>
                {selectedAirport.timezone && (
                  <div className="flex items-center text-slate-600 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Timezone: {selectedAirport.timezone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Terminals</h3>
              {loading ? (
                <div className="text-slate-600">Loading terminals...</div>
              ) : terminals.length === 0 ? (
                <div className="text-slate-600">No terminals found.</div>
              ) : (
                <div className="space-y-3">
                  {terminals.map((terminal) => (
                    <div
                      key={terminal.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="font-bold text-slate-900 mb-1">
                        {terminal.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {terminal.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex space-x-2 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === 'overview'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Plane className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                  {activeTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('maps')}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === 'maps'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapIcon className="w-4 h-4" />
                    <span>Maps</span>
                  </div>
                  {activeTab === 'maps' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('lounges')}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === 'lounges'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4" />
                    <span>Lounges</span>
                  </div>
                  {activeTab === 'lounges' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Terminals</h3>
                  {loading ? (
                    <div className="text-slate-600">Loading terminals...</div>
                  ) : terminals.length === 0 ? (
                    <div className="text-slate-600">No terminals found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {terminals.map((terminal) => (
                        <div
                          key={terminal.id}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="font-bold text-slate-900 mb-1">
                            {terminal.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {terminal.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Upcoming Flights
                  </h3>
              {loading ? (
                <div className="text-slate-600">Loading flights...</div>
              ) : flights.length === 0 ? (
                <div className="text-slate-600">No flights found.</div>
              ) : (
                <div className="space-y-3">
                  {flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-slate-900">
                            {flight.flight_number}
                          </div>
                          <div className="text-sm text-slate-600">
                            {flight.airline}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            flight.status
                          )}`}
                        >
                          {flight.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <span>{flight.origin}</span>
                          <span>→</span>
                          <span>{flight.destination}</span>
                        </div>
                        <div className="mt-1">
                          Departure: {formatTime(flight.departure_time)}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
                </div>
              </>
            )}

            {activeTab === 'maps' && selectedAirport && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <AirportMaps airportId={selectedAirport.id} airportName={selectedAirport.name} />
              </div>
            )}

            {activeTab === 'lounges' && selectedAirport && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <AirportLounges airportId={selectedAirport.id} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
