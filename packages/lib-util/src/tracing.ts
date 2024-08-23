//import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

if (process.env.TRACING_ENABLED === 'true') {
  const traceExporter = new OTLPTraceExporter({
    url: process.env.TRACING_ENDPOINT,
  });

  const TracingSDK = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new resources.Resource({
      [ATTR_SERVICE_NAME]: process.env.TAKARO_SERVICE,
    }),
  });

  // eslint-disable-next-line no-console
  console.log('Starting Takaro Tracing');
  TracingSDK.start();
}
