import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const uploadDuration = new Trend('upload_duration', true);
const errorRate = new Rate('error_rate');
const uploadCounter = new Counter('uploads_total');

const BASE_URL = 'http://localhost:3000';

// Load the real test GIF (~54 KB)
const gifData = open('./e2e/resources/cactus.gif', 'b');

export const options = {
  scenarios: {
    upload_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 5 }, // ramp up to 5 VUs
        { duration: '30s', target: 10 }, // ramp up to 10 VUs
        { duration: '15s', target: 0 }, // ramp down
      ],
      gracefulRampDown: '5s',
      exec: 'uploadAnonymous',
    },
  },
  thresholds: {
    upload_duration: ['p(95)<3000', 'p(99)<5000'],
    error_rate: ['rate<0.05'],
    http_req_failed: ['rate<0.05'],
  },
};

// Scenario: anonymous file upload on POST /files
export function uploadAnonymous() {
  const formData = {
    file: http.file(gifData, 'perf-test.gif', 'image/gif'),
    expiresIn: '1',
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/files`, formData);
  const dur = Date.now() - start;

  uploadDuration.add(dur);
  uploadCounter.add(1);

  const ok = check(res, {
    'upload status 201': (r) => r.status === 201,
    'upload has downloadToken': (r) => {
      try {
        return JSON.parse(r.body).downloadToken !== undefined;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!ok);

  sleep(1);
}
