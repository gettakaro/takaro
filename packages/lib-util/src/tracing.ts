import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

const TracingSDK = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://tempo:4317',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  resource: resources.Resource.default(),
});

TracingSDK.addResource(
  new resources.Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.TAKARO_SERVICE,
  })
);

console.log('STARTING TRACING');
TracingSDK.start();
