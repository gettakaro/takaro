import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BullMQInstrumentation } from '@jenniferplusplus/opentelemetry-instrumentation-bullmq';

interface ITracingOptions {
  serviceName: string;
}

const TracingSDK = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://tempo:4317',
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new BullMQInstrumentation(),
  ],
  resource: resources.Resource.default(),
});

export function start(opts: ITracingOptions) {
  TracingSDK.addResource(
    new resources.Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: opts.serviceName,
    })
  );

  TracingSDK.start();
}
