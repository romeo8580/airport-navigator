import { useState, useEffect } from 'react';
import { Plane, Search, Bell, BellOff, Clock, MapPin, AlertCircle } from 'lucide-react';
import { supabase, Flight, Airport } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function FlightTracker() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [flights, setFlights] = useState<(Flight & { airport?: Airport })[]>([]);
  const [trackedFlights, setTrackedFlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrackedFlights();
    const interval = setInterval(() => {
      if (searchQuery) {
        searchFlights();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadTrackedFlights = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_flights')
      .select('flight_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setTrackedFlights(data.map((item) => item.flight_id));
    }
  };

  const searchFlights = async () => {
    setLoading(true);
    setError(null);

    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      setFlights([]);
      setLoading(false);
      return;
    }

    const { data: flightData, error: flightError } = await supabase
      .from('flights')
      .select('*, airports:airport_id(*)')
      .or(`flight_number.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`)
      .order('departure_time')
      .limit(20);

    if (flightError) {
      setError('Failed to search flights. Please try again.');
      setLoading(false);
      return;
    }

    const flightsWithAirport = flightData?.map((flight: any) => ({
      ...flight,
      airport: flight.airports,
    })) || [];

    setFlights(flightsWithAirport);
    setLoading(false);
  };

  const toggleTracking = async (flightId: string) => {
    if (!user) {
      setError('Please sign in to track flights');
      return;
    }

    const isTracked = trackedFlights.includes(flightId);

    if (isTracked) {
      const { error } = await supabase
        .from('user_flights')
        .delete()
        .eq('user_id', user.id)
        .eq('flight_id', flightId);

      if (!error) {
        setTrackedFlights(trackedFlights.filter((id) => id !== flightId));
      }
    } else {
      const { error } = await supabase
        .from('user_flights')
        .insert({
          user_id: user.id,
          flight_id: flightId,
          notifications_enabled: true,
        });

      if (!error) {
        setTrackedFlights([...trackedFlights, flightId]);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'boarding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'departed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Flight Tracker</h2>
        <p className="text-slate-600">
          Search and track flights in real-time. Get instant updates on delays and gate changes.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by flight number, origin, or destination (e.g., AA001, JFK, LAX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFlights()}
              className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={searchFlights}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {flights.length === 0 && !loading && searchQuery && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No flights found matching your search.</p>
        </div>
      )}

      {flights.length === 0 && !loading && !searchQuery && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Search for flights to start tracking.</p>
        </div>
      )}

      <div className="space-y-4">
        {flights.map((flight) => {
          const isTracked = trackedFlights.includes(flight.id);
          return (
            <div
              key={flight.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {flight.flight_number}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            flight.status
                          )}`}
                        >
                          {flight.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{flight.airline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-sm text-slate-500">From</div>
                        <div className="font-semibold text-slate-900">{flight.origin}</div>
                        {flight.airport && (
                          <div className="text-sm text-slate-600">{flight.airport.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-sm text-slate-500">To</div>
                        <div className="font-semibold text-slate-900">{flight.destination}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-sm text-slate-500">Departure</div>
                        <div className="font-semibold text-slate-900">
                          {formatTime(flight.departure_time)}
                        </div>
                        <div className="text-xs text-slate-600">
                          {formatDate(flight.departure_time)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-sm text-slate-500">Arrival</div>
                        <div className="font-semibold text-slate-900">
                          {formatTime(flight.arrival_time)}
                        </div>
                        <div className="text-xs text-slate-600">
                          {formatDate(flight.arrival_time)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:border-l lg:pl-6">
                  <button
                    onClick={() => toggleTracking(flight.id)}
                    disabled={!user}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed ${
                      isTracked
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500'
                    }`}
                  >
                    {isTracked ? (
                      <>
                        <BellOff className="w-5 h-5" />
                        <span>Untrack</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        <span>Track Flight</span>
                      </>
                    )}
                  </button>
                  {!user && (
                    <p className="text-xs text-slate-500 mt-2 text-center">Sign in to track</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
