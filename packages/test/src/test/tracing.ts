import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { trace, Span, SpanStatusCode, Tracer, context as otelContext } from '@opentelemetry/api';

let sdk: NodeSDK | null = null;
let tracer: Tracer | null = null;

/**
 * Initialize OpenTelemetry tracing for tests.
 * Call this early in test bootstrap (before any HTTP requests).
 * Traces will propagate into Takaro API calls via auto-instrumented Axios.
 */
export function initTestTracing(): void {
  if (process.env.TRACING_ENABLED !== 'true') {
    return;
  }

  if (sdk) {
    return; // Already initialized
  }

  const traceExporter = new OTLPTraceExporter({
    url: process.env.TRACING_ENDPOINT || 'http://tempo:4317',
  });

  sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable noisy instrumentations
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
    resource: new resources.Resource({
      [ATTR_SERVICE_NAME]: process.env.TAKARO_SERVICE || 'takaro-tests',
    }),
  });

  sdk.start();
  tracer = trace.getTracer('takaro-tests');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk?.shutdown().catch(console.error);
  });
}

/**
 * Get the test tracer for creating spans.
 * Returns null if tracing is not enabled.
 */
export function getTestTracer(): Tracer | null {
  return tracer;
}

/**
 * Check if tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return process.env.TRACING_ENABLED === 'true' && tracer !== null;
}

/**
 * Wrap an async operation in a span.
 * If tracing is disabled, just runs the function directly.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span | null) => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  if (!tracer) {
    return fn(null);
  }

  return tracer.startActiveSpan(name, async (span) => {
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
    }

    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Create a child span within the current context.
 * Useful for manual span management when you need the span reference.
 */
export function startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span | null {
  if (!tracer) {
    return null;
  }

  const span = tracer.startSpan(name, undefined, otelContext.active());

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }

  return span;
}

/**
 * End a span with success status
 */
export function endSpanSuccess(span: Span | null): void {
  if (span) {
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  }
}

/**
 * End a span with error status
 */
export function endSpanError(span: Span | null, error: Error | string): void {
  if (span) {
    const err = error instanceof Error ? error : new Error(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.recordException(err);
    span.end();
  }
}
