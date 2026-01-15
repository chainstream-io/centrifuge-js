/**
 * Test HTTP headers passing via WebSocket handshake
 * 
 * Run: npx ts-node tests/http-headers-test.ts
 */

import WebSocket from 'ws';
// import { Centrifuge } from '../build/index.js';

// Replace with your actual token
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJqdGkiOiI0YU9xUGtHTWxZSGRTYmhIajhaZWEiLCJzdWIiOiJSZFJoTWZReWJlMFhKLXNFcDgxaDNJQ2dPclZtQTJGNCIsImlhdCI6MTc2ODQ3MDAwMCwiZXhwIjoxNzY4NTU2NDAwLCJjbGllbnRfaWQiOiJSZFJoTWZReWJlMFhKLXNFcDgxaDNJQ2dPclZtQTJGNCIsImlzcyI6Imh0dHBzOi8vZGV4LmFzaWEuYXV0aC5jaGFpbnN0cmVhbS5pby8iLCJhdWQiOiJodHRwczovL2FwaS5kZXguY2hhaW5zdHJlYW0uaW8ifQ.BOuMDsQQsmjyNBBZzYGpbzQ6pLCxkjSfvRPFLlETe1fP75MK3aXyCG0yuRZ0plrLPGJog0q-gqRm5Olx4Ha5Mrbh3TSyA-LUIdn2mYCtolijytz37JzqwyoJHZ79hUP6v18sUDIwaiN1BduQSE9Dams3M3tUKXZhC6HO80NjoYRMFqYlcdt1dzlLh8-ohRfh7Y44ZAcFJK4A038bI2MmTmMtSaYwH6d-DEIwgNCF4cjjYr5nznZ2rYdOU78ufcgTQNO-UAiCEN2jdDMJLRoTL4kHmJxd-l8q6ypoKYYrUhNvx4b726l8bvNHrSUk7pA2lbAV-rf_hcWnOjrYsFP6Lg";

const WS_URL_TEST = 'wss://realtime-dex-test.chainstream.io/connection/websocket';
// const WS_URL_PROD = 'wss://realtime-dex.chainstream.io/connection/websocket';

async function testDirectWsWithHeaders(url: string, label: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test 1: Direct ws library with headers (${label})`);
  console.log('='.repeat(60));

  return new Promise<void>((resolve) => {
    const ws = new WebSocket(url, undefined, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      }
    });

    const timeout = setTimeout(() => {
      console.log('❌ Timeout - no response');
      ws.close();
      resolve();
    }, 5000);

    ws.on('open', () => {
      console.log('✅ WebSocket connected!');
      clearTimeout(timeout);
      ws.close();
      resolve();
    });

    ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err.message);
      clearTimeout(timeout);
      resolve();
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket closed:', code, reason?.toString() || '');
    });
  });
}

// async function testCentrifugeWithHttpHeaders(url: string, label: string) {
//   console.log(`\n${'='.repeat(60)}`);
//   console.log(`Test 2: Centrifuge with httpHeaders (${label})`);
//   console.log('='.repeat(60));

//   return new Promise<void>((resolve) => {
//     const client = new Centrifuge(url, {
//       websocket: WebSocket,
//       getToken: async () => {
//         console.log('[getToken] called, returning token...');
//         return TOKEN;
//       },
//     });

//     // Set HTTP headers before connecting
//     client.setHttpHeaders({
//       'Authorization': `Bearer ${TOKEN}`,
//     });

//     console.log('[test] httpHeaders set, calling connect()...');

//     const timeout = setTimeout(() => {
//       console.log('❌ Timeout - no connection');
//       client.disconnect();
//       resolve();
//     }, 10000);

//     client.on('connecting', (ctx) => {
//       console.log('[connecting]', ctx);
//     });

//     client.on('connected', (ctx) => {
//       console.log('✅ [connected]', ctx);
//       clearTimeout(timeout);
//       client.disconnect();
//       resolve();
//     });

//     client.on('disconnected', (ctx) => {
//       console.log('[disconnected]', ctx);
//     });

//     client.on('error', (ctx) => {
//       console.error('❌ [error]', ctx);
//       clearTimeout(timeout);
//       resolve();
//     });

//     client.connect();
//   });
// }

// async function testCentrifugeWithoutHttpHeaders(url: string, label: string) {
//   console.log(`\n${'='.repeat(60)}`);
//   console.log(`Test 3: Centrifuge WITHOUT httpHeaders (${label})`);
//   console.log('='.repeat(60));

//   return new Promise<void>((resolve) => {
//     const client = new Centrifuge(url, {
//       websocket: WebSocket,
//       getToken: async () => {
//         console.log('[getToken] called, returning token...');
//         return TOKEN;
//       },
//     });

//     // NOT setting httpHeaders - only relying on getToken

//     console.log('[test] NOT setting httpHeaders, calling connect()...');

//     const timeout = setTimeout(() => {
//       console.log('❌ Timeout - no connection');
//       client.disconnect();
//       resolve();
//     }, 10000);

//     client.on('connecting', (ctx) => {
//       console.log('[connecting]', ctx);
//     });

//     client.on('connected', (ctx) => {
//       console.log('✅ [connected]', ctx);
//       clearTimeout(timeout);
//       client.disconnect();
//       resolve();
//     });

//     client.on('disconnected', (ctx) => {
//       console.log('[disconnected]', ctx);
//     });

//     client.on('error', (ctx) => {
//       console.error('❌ [error]', ctx);
//       clearTimeout(timeout);
//       resolve();
//     });

//     client.connect();
//   });
// }

async function main() {
  console.log('HTTP Headers Test for Centrifuge-js');
  console.log('====================================\n');

  // Test with production URL (should work without httpHeaders)
  // await testDirectWsWithHeaders(WS_URL_PROD, 'PROD');
  // await testCentrifugeWithoutHttpHeaders(WS_URL_PROD, 'PROD');

  // Test with test URL (requires httpHeaders via APISIX)
  await testDirectWsWithHeaders(WS_URL_TEST, 'TEST');
  // await testCentrifugeWithHttpHeaders(WS_URL_TEST, 'TEST');
  // await testCentrifugeWithoutHttpHeaders(WS_URL_TEST, 'TEST - expect fail');

  console.log('\n\nAll tests completed.');
  process.exit(0);
}

main().catch(console.error);

