import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  Span,
  SpanStatusCode,
  Tracer,
  context as otelContext,
} from '@opentelemetry/api';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

// Enable diagnostic logging if requested (must be before any other OTEL setup)
if (process.env.TRACING_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

// Use globalThis to prevent double-init and share state across module instances
const TRACING_INIT_KEY = '__TAKARO_TRACING_INITIALIZED__';
const TRACING_TRACER_KEY = '__TAKARO_TRACER__';
const TRACING_SDK_KEY = '__TAKARO_TRACING_SDK__';
const TRACING_SHUTDOWN_KEY = '__TAKARO_TRACING_SHUTDOWN__';

// Side-effect initialization for --import pattern
// Only init once even if module is loaded multiple times
if (process.env.TRACING_ENABLED === 'true' && !(globalThis as any)[TRACING_INIT_KEY]) {
  (globalThis as any)[TRACING_INIT_KEY] = true;

  // TRACING_ENDPOINT should be the full OTLP HTTP URL (e.g., http://collector:4318/v1/traces)
  const endpoint = process.env.TRACING_ENDPOINT;
  const traceExporter = endpoint ? new OTLPTraceExporter({ url: endpoint }) : undefined;

  // Use SimpleSpanProcessor for tests to ensure spans are exported immediately
  // BatchSpanProcessor (default) can lose spans when process exits quickly with --test-force-exit
  const useSimpleProcessor = process.env.TRACING_SIMPLE_PROCESSOR === 'true';
  const useConsoleExporter = process.env.TRACING_CONSOLE === 'true';

  // Build span processors array
  const spanProcessors = [];
  if (traceExporter && useSimpleProcessor) {
    spanProcessors.push(new SimpleSpanProcessor(traceExporter));
  }
  if (useConsoleExporter) {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  const sdk = new NodeSDK({
    // Pass spanProcessors if we have any, otherwise let SDK use default with traceExporter
    ...(spanProcessors.length > 0 ? { spanProcessors } : { traceExporter }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
    resource: new resources.Resource({
      [ATTR_SERVICE_NAME]: process.env.TAKARO_SERVICE || 'takaro',
    }),
  });

  console.log(`Starting Takaro Tracing (${useSimpleProcessor ? 'SimpleSpanProcessor' : 'BatchSpanProcessor'})`);
  sdk.start();

  (globalThis as any)[TRACING_SDK_KEY] = sdk;
  (globalThis as any)[TRACING_TRACER_KEY] = trace.getTracer(process.env.TAKARO_SERVICE || 'takaro');

  // Ensure spans are flushed on process exit
  const shutdown = async () => {
    // Guard against double-shutdown (SIGTERM + SIGINT + beforeExit can all fire)
    if ((globalThis as any)[TRACING_SHUTDOWN_KEY]) return;
    (globalThis as any)[TRACING_SHUTDOWN_KEY] = true;

    try {
      await sdk.shutdown();
    } catch (e) {
      console.error('Error shutting down tracing SDK:', e);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // For normal process exit (like tests completing), flush before exit
  process.on('beforeExit', async () => {
    await shutdown();
  });
}

/**
 * Get the tracer for creating spans.
 * Returns null if tracing is not enabled.
 */
export function getTracer(): Tracer | null {
  return (globalThis as any)[TRACING_TRACER_KEY] || null;
}

/**
 * Check if tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return process.env.TRACING_ENABLED === 'true' && getTracer() !== null;
}

/**
 * Shutdown the tracing SDK and export any pending spans.
 * Note: After calling this, tracing is permanently disabled for the process.
 * Useful before process exit in short-lived processes like tests.
 */
export async function shutdownTracing(): Promise<void> {
  // Use the same guard as the signal handlers
  if ((globalThis as any)[TRACING_SHUTDOWN_KEY]) return;
  (globalThis as any)[TRACING_SHUTDOWN_KEY] = true;

  const sdk = (globalThis as any)[TRACING_SDK_KEY] as NodeSDK | undefined;
  if (sdk) {
    await sdk.shutdown();
  }
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
  const tracer = getTracer();
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
  const tracer = getTracer();
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
