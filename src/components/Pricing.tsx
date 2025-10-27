import { Check, Plane, Zap, Crown } from 'lucide-react';

interface PricingProps {
  onGetStarted: () => void;
}

export function Pricing({ onGetStarted }: PricingProps) {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for occasional travelers',
      icon: Plane,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      buttonText: 'Get Started',
      buttonStyle: 'bg-slate-900 hover:bg-slate-800 text-white',
      features: [
        'Search any airport worldwide',
        'View flight status updates',
        'Terminal and gate information',
      ],
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: 'per month',
      yearlyPrice: '$49.99',
      description: 'For frequent flyers who need more',
      icon: Zap,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      buttonText: 'Start Free Trial',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      popular: true,
      features: [
        'Everything in Free',
        'Real-time flight tracking',
        'Flight delay notifications',
        'Unlimited saved airports',
        'Priority customer support',
        'Offline airport maps',
        'Track up to 10 flights',
      ],
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select the perfect plan for your travel needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                  tier.popular ? 'border-2 border-blue-500 transform scale-105' : 'border border-slate-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className={`w-12 h-12 ${tier.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${tier.iconColor}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-slate-600 mb-6">{tier.description}</p>

                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-600 ml-2">/ {tier.period}</span>
                  </div>
                  {(tier as any).yearlyPrice && (
                    <p className="text-sm text-slate-600 mb-4">
                      or {(tier as any).yearlyPrice} / year
                    </p>
                  )}

                  <button
                    onClick={onGetStarted}
                    className={`w-full py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${tier.buttonStyle}`}
                  >
                    {tier.buttonText}
                  </button>

                  <div className="mt-8 space-y-4">
                    <div className="text-sm font-semibold text-slate-900 mb-3">What's included:</div>
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-slate-50 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Need a custom solution?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            We offer tailored enterprise solutions for airports, airlines, and large travel organizations. Get in touch to discuss your specific needs.
          </p>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
            Contact Enterprise Sales
          </button>
        </div>

        <div className="mt-12 text-center text-sm text-slate-600">
          <p>All plans include 14-day money-back guarantee. No credit card required for Free plan.</p>
        </div>
      </div>
    </div>
  );
}
