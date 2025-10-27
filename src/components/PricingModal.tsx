import { useState, useEffect } from 'react';
import { Check, X, Sparkles, Zap, Building } from 'lucide-react';
import { supabase, SubscriptionTier } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { trackSubscriptionView, trackSubscriptionStart } from '../lib/analytics';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (isOpen) {
      loadTiers();
      trackSubscriptionView('all');
    }
  }, [isOpen]);

  const loadTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    if (!error && data) {
      setTiers(data);
    }
    setLoading(false);
  };

  const handleSubscribe = (tier: SubscriptionTier) => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    trackSubscriptionStart(tier.name);
    alert(`Stripe integration required. This would start checkout for ${tier.name} tier.`);
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'business':
        return <Building className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'pro':
        return 'from-blue-500 to-blue-600';
      case 'business':
        return 'from-slate-700 to-slate-900';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Plan</h2>
              <p className="text-slate-600">Unlock premium features and elevate your airport experience</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="flex items-center justify-center mb-8 space-x-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => {
                const price = billingCycle === 'monthly' ? tier.price_monthly : tier.price_yearly;
                const pricePerMonth = billingCycle === 'yearly' ? (tier.price_yearly / 12).toFixed(2) : price;
                const isPro = tier.name.toLowerCase() === 'pro';

                return (
                  <div
                    key={tier.id}
                    className={`rounded-xl border-2 overflow-hidden ${
                      isPro
                        ? 'border-blue-600 shadow-xl scale-105'
                        : 'border-slate-200 shadow-md'
                    }`}
                  >
                    {isPro && (
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 text-sm font-semibold">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTierColor(tier.name)} text-white flex items-center justify-center mb-4`}>
                        {getTierIcon(tier.name)}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-slate-900">${pricePerMonth}</span>
                          <span className="text-slate-600 ml-2">/month</span>
                        </div>
                        {billingCycle === 'yearly' && price > 0 && (
                          <p className="text-sm text-slate-600 mt-1">
                            ${price} billed annually
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-8">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscribe(tier)}
                        disabled={!user && tier.price_monthly === 0}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          isPro
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {tier.price_monthly === 0 ? 'Current Plan' : 'Get Started'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-slate-600">
            <p>All plans include 14-day money-back guarantee. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
