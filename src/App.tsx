import { useState } from 'react';
import { Plane, MapPin, Search, Menu, X, LogOut, User as UserIcon, Radio, LayoutDashboard } from 'lucide-react';
import { AirportSearch } from './components/AirportSearch';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Pricing } from './components/Pricing';
import { FlightTracker } from './components/FlightTracker';
import { Dashboard } from './components/Dashboard';
import { PasswordReset } from './components/PasswordReset';
import { InstallPrompt } from './components/InstallPrompt';
import { useAuth } from './contexts/AuthContext';

type View = 'home' | 'find' | 'signin' | 'create' | 'pricing' | 'tracker' | 'dashboard' | 'reset';

function App() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <InstallPrompt />
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Plane className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Airport Navigator
              </h1>
            </button>

            <div className="hidden md:flex items-center space-x-8">
              {user && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => setCurrentView('find')}
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Find an Airport
              </button>
              <button
                onClick={() => setCurrentView('tracker')}
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Track Flights
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => setCurrentView('pricing')}
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Pricing
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-slate-700 hover:text-red-600 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentView('signin')}
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => setCurrentView('pricing')}
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Pricing
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-200">
              {user && (
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentView('find');
                  setMobileMenuOpen(false);
                }}
                className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
              >
                Find an Airport
              </button>
              <button
                onClick={() => {
                  setCurrentView('tracker');
                  setMobileMenuOpen(false);
                }}
                className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
              >
                Track Flights
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('pricing');
                      setMobileMenuOpen(false);
                    }}
                    className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
                  >
                    Pricing
                  </button>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="px-2 py-2 text-sm text-slate-600">{user.email}</div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block text-red-600 hover:text-red-700 font-medium transition-colors py-2 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('signin');
                      setMobileMenuOpen(false);
                    }}
                    className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('create');
                      setMobileMenuOpen(false);
                    }}
                    className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('pricing');
                      setMobileMenuOpen(false);
                    }}
                    className="block text-slate-700 hover:text-blue-600 font-medium transition-colors py-2 w-full text-left"
                  >
                    Pricing
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      <main>
        {currentView === 'home' && (
          <>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="text-center space-y-8">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Navigate with Confidence</span>
                </div>

                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                  Your smart airport
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    companion
                  </span>
                </h2>

                <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Find gates, shops, and flights in real time. Never miss your flight again with intelligent navigation and live updates.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <button
                    onClick={() => setCurrentView('create')}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Get Started
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('find')}
                    className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-slate-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg"
                  >
                    Try Free
                  </button>
                </div>

                <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <button
                    onClick={() => setCurrentView('find')}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Smart Search</h3>
                    <p className="text-slate-600">
                      Find any gate, shop, or restaurant instantly with intelligent search
                    </p>
                  </button>

                  <button
                    onClick={() => setCurrentView('tracker')}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Radio className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Flight Tracking</h3>
                    <p className="text-slate-600">
                      Monitor your flight status and receive instant delay notifications
                    </p>
                  </button>

                  <button
                    onClick={() => setCurrentView('pricing')}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Premium Features</h3>
                    <p className="text-slate-600">
                      Unlock advanced features and priority support with our plans
                    </p>
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                  <h3 className="text-4xl font-bold text-slate-900">
                    Trusted by travelers worldwide
                  </h3>
                  <p className="text-xl text-slate-600">
                    Join thousands of passengers who navigate airports with confidence
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="text-center p-6">
                    <div className="text-5xl font-bold text-blue-600 mb-2">500K+</div>
                    <div className="text-slate-600 font-medium">Active Users</div>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-5xl font-bold text-blue-600 mb-2">1,200+</div>
                    <div className="text-slate-600 font-medium">Airports Covered</div>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-5xl font-bold text-blue-600 mb-2">99.9%</div>
                    <div className="text-slate-600 font-medium">Uptime Guarantee</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === 'find' && <AirportSearch />}

        {currentView === 'signin' && (
          <SignIn
            onSwitchToSignUp={() => setCurrentView('create')}
            onForgotPassword={() => setCurrentView('reset')}
          />
        )}

        {currentView === 'reset' && (
          <PasswordReset onBack={() => setCurrentView('signin')} />
        )}

        {currentView === 'create' && (
          <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />
        )}

        {currentView === 'pricing' && (
          <Pricing onGetStarted={() => setCurrentView('create')} />
        )}

        {currentView === 'tracker' && <FlightTracker />}

        {currentView === 'dashboard' && <Dashboard />}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Plane className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-white">Airport Navigator</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 Airport Navigator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
