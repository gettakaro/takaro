// CI Profiling - Timing Utility
// Temporary code to identify CI performance hotspots

const timings: Map<string, number[]> = new Map();
let testCounter = 0;

export function timeStart(category: string, step: string): () => void {
  const start = Date.now();
  const label = `${category}/${step}`;
  return () => {
    const duration = Date.now() - start;
    const existing = timings.get(label) || [];
    existing.push(duration);
    timings.set(label, existing);
    console.log(`[TIMING] ${label}: ${duration}ms`);
  };
}

export function incrementTestCount(): void {
  testCounter++;
}

export function printTimingSummary(): void {
  console.log('\n========== CI TIMING SUMMARY ==========');
  console.log(`Total tests run: ${testCounter}`);

  // Sort by total time descending
  const sorted = [...timings.entries()].sort((a, b) => {
    const totalA = a[1].reduce((x, y) => x + y, 0);
    const totalB = b[1].reduce((x, y) => x + y, 0);
    return totalB - totalA;
  });

  for (const [key, values] of sorted) {
    const total = values.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    console.log(`[SUMMARY] ${key}: total=${total}ms, avg=${avg}ms, min=${min}ms, max=${max}ms, calls=${values.length}`);
  }
  console.log('==========================================\n');
}
