import { useState, useEffect } from 'react';
import { Plane, Bell, Clock, MapPin, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { supabase, Flight, Airport } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [trackedFlights, setTrackedFlights] = useState<(Flight & { airport?: Airport })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrackedFlights();
    const interval = setInterval(loadTrackedFlights, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadTrackedFlights = async () => {
    if (!user) {
      setTrackedFlights([]);
      setLoading(false);
      return;
    }

    setError(null);

    const { data: userFlights, error: userFlightsError } = await supabase
      .from('user_flights')
      .select('flight_id')
      .eq('user_id', user.id);

    if (userFlightsError) {
      setError('Failed to load your tracked flights');
      setLoading(false);
      return;
    }

    if (!userFlights || userFlights.length === 0) {
      setTrackedFlights([]);
      setLoading(false);
      return;
    }

    const flightIds = userFlights.map((uf) => uf.flight_id);

    const { data: flightData, error: flightError } = await supabase
      .from('flights')
      .select('*, airports:airport_id(*)')
      .in('id', flightIds)
      .order('departure_time');

    if (flightError) {
      setError('Failed to load flight details');
      setLoading(false);
      return;
    }

    const flightsWithAirport = flightData?.map((flight: any) => ({
      ...flight,
      airport: flight.airports,
    })) || [];

    setTrackedFlights(flightsWithAirport);
    setLoading(false);
  };

  const untrackFlight = async (flightId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_flights')
      .delete()
      .eq('user_id', user.id)
      .eq('flight_id', flightId);

    if (!error) {
      setTrackedFlights(trackedFlights.filter((f) => f.id !== flightId));
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeUntilDeparture = (departureTime: string | null) => {
    if (!departureTime) return null;
    const now = new Date();
    const departure = new Date(departureTime);
    const diff = departure.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return 'Departed';
    if (hours < 0) return 'Boarding Soon';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const upcomingFlights = trackedFlights.filter(f => {
    if (!f.departure_time) return false;
    return new Date(f.departure_time) > new Date();
  });

  const pastFlights = trackedFlights.filter(f => {
    if (!f.departure_time) return false;
    return new Date(f.departure_time) <= new Date();
  });

  const delayedFlights = upcomingFlights.filter(f => f.status === 'delayed');

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your dashboard</h2>
          <p className="text-slate-600">Track your flights and get personalized updates</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading your flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Dashboard</h2>
        <p className="text-slate-600">Welcome back! Here's an overview of your tracked flights.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tracked Flights</p>
              <p className="text-3xl font-bold text-slate-900">{trackedFlights.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-slate-900">{upcomingFlights.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Delayed</p>
              <p className="text-3xl font-bold text-slate-900">{delayedFlights.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {trackedFlights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tracked flights yet</h3>
          <p className="text-slate-600 mb-6">
            Start tracking flights to get real-time updates and notifications
          </p>
        </div>
      ) : (
        <>
          {upcomingFlights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Upcoming Flights</span>
              </h3>
              <div className="space-y-4">
                {upcomingFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-2xl font-bold text-slate-900">
                                {flight.flight_number}
                              </h4>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  flight.status
                                )}`}
                              >
                                {flight.status}
                              </span>
                              {flight.status === 'delayed' && (
                                <span className="flex items-center space-x-1 text-orange-600 text-sm font-medium">
                                  <Bell className="w-4 h-4" />
                                  <span>Alert</span>
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600">{flight.airline}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-500">Departs in</div>
                            <div className="text-lg font-bold text-blue-600">
                              {getTimeUntilDeparture(flight.departure_time)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        </div>
                      </div>

                      <div className="lg:border-l lg:pl-6">
                        <button
                          onClick={() => untrackFlight(flight.id)}
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                        >
                          Untrack
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastFlights.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>Past Flights</span>
              </h3>
              <div className="space-y-4">
                {pastFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-slate-50 rounded-xl shadow-sm p-6 opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-bold text-slate-900">
                            {flight.flight_number}
                          </h4>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-slate-200 text-slate-700 border-slate-300">
                            Departed
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {flight.origin} → {flight.destination} • {formatDate(flight.departure_time)}
                        </p>
                      </div>
                      <button
                        onClick={() => untrackFlight(flight.id)}
                        className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
