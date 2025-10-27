declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackFlightSearch = (airportCode: string) => {
  event({
    action: 'search',
    category: 'Flight',
    label: airportCode,
  });
};

export const trackFlightTracking = (flightNumber: string) => {
  event({
    action: 'track_flight',
    category: 'Flight',
    label: flightNumber,
  });
};

export const trackAirportView = (airportName: string) => {
  event({
    action: 'view_airport',
    category: 'Airport',
    label: airportName,
  });
};

export const trackLoungeView = (loungeName: string) => {
  event({
    action: 'view_lounge',
    category: 'Lounge',
    label: loungeName,
  });
};

export const trackMapView = (mapType: string) => {
  event({
    action: 'view_map',
    category: 'Map',
    label: mapType,
  });
};

export const trackSignUp = (method: string) => {
  event({
    action: 'sign_up',
    category: 'Auth',
    label: method,
  });
};

export const trackSignIn = (method: string) => {
  event({
    action: 'sign_in',
    category: 'Auth',
    label: method,
  });
};

export const trackSubscriptionView = (tier: string) => {
  event({
    action: 'view_pricing',
    category: 'Subscription',
    label: tier,
  });
};

export const trackSubscriptionStart = (tier: string) => {
  event({
    action: 'start_checkout',
    category: 'Subscription',
    label: tier,
  });
};
