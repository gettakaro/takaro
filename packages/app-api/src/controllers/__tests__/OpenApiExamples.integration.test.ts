import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { describe } from 'node:test';
import { OpenAPIObject } from 'openapi3-ts';
import axios from 'axios';

const group = 'OpenApiExamples';

interface ExampleTestCase {
  path: string;
  method: string;
  exampleName: string;
  exampleValue: any;
  operationId: string;
}

function extractExamplesFromSpec(spec: OpenAPIObject): ExampleTestCase[] {
  const examples: ExampleTestCase[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem as any)) {
      if (typeof operation === 'object' && operation !== null && 'requestBody' in operation) {
        const requestBody = (operation as any).requestBody;
        const operationExamples = requestBody?.content?.['application/json']?.examples;

        if (operationExamples) {
          for (const [exampleName, exampleData] of Object.entries(operationExamples)) {
            const example = exampleData as any;
            examples.push({
              path,
              method: method.toUpperCase(),
              exampleName,
              exampleValue: example.value,
              operationId: (operation as any).operationId || `${method}_${path}`,
            });
          }
        }
      }
    }
  }

  return examples;
}

// Fetch the OpenAPI spec once at module load
const specPromise = axios
  .get(`${integrationConfig.get('host')}/openapi.json`)
  .then((res) => res.data) as Promise<OpenAPIObject>;

describe(group, async function () {
  const spec = await specPromise;
  const examples = extractExamplesFromSpec(spec);
  console.log(`Found ${examples.length} examples in OpenAPI spec`);

  // Filter out domain controller examples (admin-only endpoints)
  const filteredExamples = examples.filter((example) => !example.path.startsWith('/domain'));
  console.log(`Testing ${filteredExamples.length} examples (excluding domain controller)`);

  // Create one test per example
  const tests = filteredExamples.map((example) => {
    const testName = `${example.method} ${example.path} - ${example.exampleName}`;

    return new IntegrationTest({
      group,
      snapshot: false,
      name: testName,
      standardEnvironment: true,
      test: async function () {
        // Skip endpoints with path parameters
        if (example.path.includes(':id') || example.path.includes('{')) {
          console.log(`Skipping: Path parameter endpoint`);
          return;
        }

        // Use the raw axios instance from the client
        const axiosInstance = (this.client as any).axiosInstance;

        const response = await axiosInstance({
          method: example.method.toLowerCase(),
          url: example.path,
          data: example.exampleValue,
        });

        expect(response.status).to.equal(200);
      },
    });
  });

  // Run all tests
  tests.forEach((test) => test.run());
});
