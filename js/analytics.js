(function initGoogleAnalytics(window, document) {
  const config = window.DandyAnalyticsConfig || {};
  const measurementId = typeof config.measurementId === 'string' ? config.measurementId.trim() : '';
  const allowLocalhost = config.allowLocalhost === true;
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (!measurementId) {
    return;
  }

  if (isLocalhost && !allowLocalhost) {
    console.info('Google Analytics is disabled on localhost.');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(analyticsScript);

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
})(window, document);
