import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { promptInstall, canInstall, isStandalone } from '../lib/pwa';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkInstallability = () => {
      if (!isStandalone() && canInstall()) {
        setShowPrompt(true);
      }
    };

    checkInstallability();
    window.addEventListener('beforeinstallprompt', checkInstallability);

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallability);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 mb-1">Install Airport Navigator</h3>
          <p className="text-sm text-slate-600 mb-4">
            Get quick access to flight tracking and airport info right from your home screen.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors"
            >
              Install App
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
