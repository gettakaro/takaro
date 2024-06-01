import { onCLS, onINP, onLCP, MetricType } from 'web-vitals';

const sendToAnalytics = (metric: MetricType) => {
  console.log(metric);
  // TODO: we need to send this to grafana.
  // const body = JSON.stringify(metric);
  //(navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
  // fetch('/analytics', {body, method: 'POST', keepalive: true});
};

export function registerWebVitalCallbacks() {
  // CLS = Cumulative Layout Shift
  onCLS(sendToAnalytics);
  // LCP = Largest Contentful Paint
  onLCP(sendToAnalytics);
  // INP = Interaction Next Paint
  // https://web.dev/articles/inp
  onINP(sendToAnalytics);
}
