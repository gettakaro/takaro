#!/usr/bin/env node

/**
 * Parses JUnit XML test results and publishes them as a GitHub Check Run.
 *
 * Usage: node publish-test-results.mjs <check-name> [report-dir]
 *
 * Environment variables:
 *   GH_TOKEN - GitHub token with checks:write permission
 *   GITHUB_REPOSITORY - owner/repo format
 *   GITHUB_SHA - Commit SHA to attach the check to
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { XMLParser } from 'fast-xml-parser';

const checkName = process.argv[2] || 'Test Results';
const reportDir = process.argv[3] || 'reports/junit';

if (!existsSync(reportDir)) {
  console.log(`Report directory ${reportDir} does not exist, skipping test result publishing`);
  process.exit(0);
}

const files = readdirSync(reportDir).filter((f) => f.endsWith('.xml'));
if (files.length === 0) {
  console.log(`No XML files found in ${reportDir}, skipping test result publishing`);
  process.exit(0);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
let totalSkipped = 0;
let totalErrors = 0;
let totalTime = 0;
const failures = [];
const suiteResults = [];

for (const file of files) {
  const xml = readFileSync(`${reportDir}/${file}`, 'utf-8');
  const result = parser.parse(xml);

  const testsuites = result.testsuites || result.testsuite;
  if (!testsuites) continue;

  const suites = Array.isArray(testsuites.testsuite)
    ? testsuites.testsuite
    : testsuites.testsuite
      ? [testsuites.testsuite]
      : [testsuites];

  for (const suite of suites) {
    const tests = parseInt(suite['@_tests'] || '0', 10);
    const failureCount = parseInt(suite['@_failures'] || '0', 10);
    const errorCount = parseInt(suite['@_errors'] || '0', 10);
    const skipped = parseInt(suite['@_skipped'] || '0', 10);
    const time = parseFloat(suite['@_time'] || '0');

    totalTests += tests;
    totalFailed += failureCount;
    totalErrors += errorCount;
    totalSkipped += skipped;
    totalTime += time;

    suiteResults.push({
      name: suite['@_name'] || file,
      tests,
      passed: tests - failureCount - errorCount - skipped,
      failed: failureCount + errorCount,
      skipped,
      time: time.toFixed(2),
    });

    const testcases = Array.isArray(suite.testcase) ? suite.testcase : suite.testcase ? [suite.testcase] : [];

    for (const tc of testcases) {
      const failure = tc.failure || tc.error;
      if (failure) {
        const message = typeof failure === 'string' ? failure : failure['@_message'] || failure['#text'] || 'Test failed';

        failures.push({
          path: tc['@_classname'] || suite['@_name'] || file,
          annotation_level: 'failure',
          title: tc['@_name'] || 'Unknown test',
          message: message.substring(0, 1000),
          start_line: 1,
          end_line: 1,
        });
      }
    }
  }
}

totalPassed = totalTests - totalFailed - totalErrors - totalSkipped;

const conclusion = totalFailed + totalErrors > 0 ? 'failure' : 'success';

const title = `${totalTests} tests: ${totalPassed} passed, ${totalFailed + totalErrors} failed, ${totalSkipped} skipped`;

let summary = `## ${checkName}\n\n`;
summary += `| Metric | Value |\n`;
summary += `|--------|-------|\n`;
summary += `| Total Tests | ${totalTests} |\n`;
summary += `| Passed | ${totalPassed} |\n`;
summary += `| Failed | ${totalFailed + totalErrors} |\n`;
summary += `| Skipped | ${totalSkipped} |\n`;
summary += `| Duration | ${totalTime.toFixed(2)}s |\n\n`;

if (suiteResults.length > 0) {
  summary += `### Test Suites\n\n`;
  summary += `| Suite | Tests | Passed | Failed | Skipped | Time |\n`;
  summary += `|-------|-------|--------|--------|---------|------|\n`;
  for (const suite of suiteResults.slice(0, 50)) {
    const status = suite.failed > 0 ? '❌' : '✅';
    summary += `| ${status} ${suite.name.substring(0, 50)} | ${suite.tests} | ${suite.passed} | ${suite.failed} | ${suite.skipped} | ${suite.time}s |\n`;
  }
  if (suiteResults.length > 50) {
    summary += `\n*... and ${suiteResults.length - 50} more suites*\n`;
  }
}

if (failures.length > 0) {
  summary += `\n### Failed Tests\n\n`;
  for (const f of failures.slice(0, 20)) {
    summary += `- **${f.title}** (${f.path})\n`;
    summary += `  \`\`\`\n  ${f.message.substring(0, 200)}\n  \`\`\`\n`;
  }
  if (failures.length > 20) {
    summary += `\n*... and ${failures.length - 20} more failures*\n`;
  }
}

const repo = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;

if (!repo || !sha) {
  console.log('GITHUB_REPOSITORY or GITHUB_SHA not set, printing results to console instead');
  console.log(title);
  console.log(summary);
  process.exit(conclusion === 'failure' ? 1 : 0);
}

const payload = {
  name: checkName,
  head_sha: sha,
  status: 'completed',
  conclusion,
  output: {
    title,
    summary,
    annotations: failures.slice(0, 50),
  },
};

const payloadJson = JSON.stringify(payload);

try {
  execSync(`gh api repos/${repo}/check-runs -X POST --input -`, {
    input: payloadJson,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`Published check run: ${checkName} - ${title}`);
} catch (error) {
  console.error('Failed to publish check run:', error.message);
  console.log('Payload:', payloadJson);
  process.exit(1);
}
