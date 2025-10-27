import { useState, useEffect } from 'react';
import { Coffee, Star, Clock, MapPin, Lock, Sparkles } from 'lucide-react';
import { supabase, AirportLounge } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AirportLoungesProps {
  airportId: string;
}

export function AirportLounges({ airportId }: AirportLoungesProps) {
  const { user } = useAuth();
  const [lounges, setLounges] = useState<AirportLounge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    loadLounges();
  }, [airportId, user]);

  const loadLounges = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('airport_lounges')
      .select('*')
      .eq('airport_id', airportId)
      .order('is_premium', { ascending: true })
      .order('rating', { ascending: false });

    if (!error && data) {
      setLounges(data);
    }

    setLoading(false);
  };

  const handleLoungeClick = (lounge: AirportLounge) => {
    if (lounge.is_premium && !user) {
      setShowPremiumModal(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading lounges...</p>
      </div>
    );
  }

  if (lounges.length === 0) {
    return (
      <div className="text-center py-12">
        <Coffee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No lounges available</h3>
        <p className="text-slate-600">Lounge information for this airport is coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Airport Lounges</h3>
        {lounges.some(l => l.is_premium) && (
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <Sparkles className="w-4 h-4" />
            <span>Premium content available</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lounges.map((lounge) => (
          <div
            key={lounge.id}
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden ${
              lounge.is_premium && !user ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleLoungeClick(lounge)}
          >
            <div className="relative h-48 overflow-hidden">
              {lounge.image_url ? (
                <img
                  src={lounge.image_url}
                  alt={lounge.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Coffee className="w-16 h-16 text-blue-600/30" />
                </div>
              )}
              {lounge.is_premium && !user && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Premium Content</p>
                    <p className="text-sm">Sign in to unlock</p>
                  </div>
                </div>
              )}
              {lounge.is_premium && user && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{lounge.name}</h4>
                  {lounge.airline && (
                    <p className="text-sm text-slate-600">{lounge.airline}</p>
                  )}
                </div>
                {lounge.rating && (
                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-900">{lounge.rating}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{lounge.location}</span>
                </div>

                <div className="flex items-start space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">
                    {lounge.operating_hours.open} - {lounge.operating_hours.close}
                  </span>
                </div>
              </div>

              {(!lounge.is_premium || user) && (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {lounge.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {lounge.amenities.length > 4 && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          +{lounge.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      <strong>Access:</strong> {lounge.access_requirements}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPremiumModal(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium Content</h3>
              <p className="text-slate-600 mb-6">
                Sign in to access detailed lounge information, amenities, and exclusive content.
              </p>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
