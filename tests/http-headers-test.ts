/**
 * Test HTTP headers passing via WebSocket handshake
 * 
 * Run: npx ts-node tests/http-headers-test.ts
 */

import WebSocket from 'ws';
import { Centrifuge } from '../build/index.js';

// Replace with your actual token
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleXN0b3JlLUNIQU5HRS1NRSJ9.eyJqdGkiOiJsOU1KdDU5ZzZSTnlRWlp5UExiSlgiLCJzdWIiOiJIR2hWbmpiSWlheDFIcDNUakdUd083WU9FUkJURXRwaSIsImlhdCI6MTc2ODU3NTAyNywiZXhwIjoxNzY4NjYxNDI3LCJjbGllbnRfaWQiOiJIR2hWbmpiSWlheDFIcDNUakdUd083WU9FUkJURXRwaSIsImlzcyI6Imh0dHBzOi8vZGV4LmFzaWEuYXV0aC5jaGFpbnN0cmVhbS5pby8iLCJhdWQiOiJodHRwczovL2FwaS5kZXguY2hhaW5zdHJlYW0uaW8ifQ.OKB7bHi5ZV2yYiNGTBwMV21MY4wOV8bqaveN_k6KkzuDefox9F_2PHixdt9EIyUiAjTDw16g3jhDOvf_7Ku4djnzNS5nq1zSQJP1Pg4q7le5L16fGj-ZamVmvnOjQ6X3CQHHWDz07ohrB4YHtM3ZPcAse-xflt0c7G6ULYau2di07QdvxOVEhvoJSj928nJgd4UwdvLIi3DyuGjKiFxacaXLJfUs-n_8vPj_QUZZX58q5XW8ZhiifTd_YVKwZRCImcIttz8BbuT0qP-UxDgKTbUZm1IHoJBFfaVXauu-w-NgEBlny_dnbrEWa7tyXeTWRVI6vSAR9zlFNUaih_A1tg";

const WS_URL_TEST = 'wss://realtime-dex.chainstream.io/connection/websocket';
// const WS_URL_PROD = 'wss://realtime-dex.chainstream.io/connection/websocket';

// async function testDirectWsWithHeaders(url: string, label: string) {
//   console.log(`\n${'='.repeat(60)}`);
//   console.log(`Test 1: Direct ws library with headers (${label})`);
//   console.log('='.repeat(60));

//   return new Promise<void>((resolve) => {
//     const ws = new WebSocket(url, undefined, {
//       headers: {
//         'Authorization': `Bearer ${TOKEN}`,
//       }
//     });

//     const timeout = setTimeout(() => {
//       console.log('❌ Timeout - no response');
//       ws.close();
//       resolve();
//     }, 5000);

//     ws.on('open', () => {
//       console.log('✅ WebSocket connected!');
//       clearTimeout(timeout);
//       ws.close();
//       resolve();
//     });

//     ws.on('error', (err) => {
//       console.error('❌ WebSocket error:', err.message);
//       clearTimeout(timeout);
//       resolve();
//     });

//     ws.on('close', (code, reason) => {
//       console.log('WebSocket closed:', code, reason?.toString() || '');
//     });
//   });
// }

async function testCentrifugeWithHttpHeaders(url: string, label: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test 2: Centrifuge with httpHeaders (${label})`);
  console.log('='.repeat(60));

  return new Promise<void>((resolve) => {
    const client = new Centrifuge(url, {
      websocket: WebSocket,
      getToken: async () => {
        console.log('[getToken] called, returning token...');
        return TOKEN;
      },
    });

    client.on('connecting', (ctx) => {
      console.log('[connecting]', ctx);
    });

    client.on('connected', (ctx) => {
      console.log('✅ [connected]', ctx);
      
      // 连接成功后创建订阅
      const channel = "dex-candle:sol_EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v_1s";
      // const filter = "balance > 20";  // 可选：添加 filter
      
      console.log(`\n📝 Subscribing to channel: ${channel}`);
      // console.log(`🔍 With filter: ${filter}`);
      
      const sub = client.newSubscription(channel, {
        // filter: filter  // 取消注释以启用 filter
      });
      
      sub.on('subscribing', (ctx) => {
        console.log('[sub:subscribing]', ctx);
      });
      
      sub.on('subscribed', (ctx) => {
        console.log('✅ [sub:subscribed]', ctx);
        console.log('\n📡 Waiting for messages...\n');
      });
      
      sub.on('error', (ctx) => {
        console.error('❌ [sub:error]', ctx);
      });
      
      sub.on('publication', (ctx) => {
        console.log('📊 [publication]', new Date().toISOString());
        console.log(JSON.stringify(ctx, null, 2));
        console.log('');
      });
      
      sub.on('unsubscribed', (ctx) => {
        console.log('[sub:unsubscribed]', ctx);
      });
      
      sub.subscribe();
    });

    client.on('disconnected', (ctx) => {
      console.log('[disconnected]', ctx);
      resolve();
    });

    client.on('error', (ctx) => {
      console.error('❌ [error]', ctx);
    });

    // 处理 Ctrl+C 退出
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Received SIGINT, disconnecting...');
      client.disconnect();
    });

    client.connect();
  });
}

// async function testCentrifugeWithHeadersOption(url: string, label: string) {
//   console.log(`\n${'='.repeat(60)}`);
//   console.log(`Test: Centrifuge with headers option (${label})`);
//   console.log('='.repeat(60));

//   return new Promise<void>((resolve) => {
//     // 通过 headers 选项传递 Authorization token
//     const client = new Centrifuge(url, {
//       websocket: WebSocket,
//       headers: {
//         'Authorization': `Bearer ${TOKEN}`,
//       },
//       getToken: async () => {
//         console.log('[getToken] called, returning token...');
//         return TOKEN;
//       },
//     });

//     console.log('[test] Using headers option with Authorization token...');

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
  // await testDirectWsWithHeaders(WS_URL_TEST, 'TEST');
  // await testCentrifugeWithHeadersOption(WS_URL_TEST, 'TEST');
  await testCentrifugeWithHttpHeaders(WS_URL_TEST, 'TEST');
  // await testCentrifugeWithoutHttpHeaders(WS_URL_TEST, 'TEST - expect fail');

  console.log('\n\nAll tests completed.');
  process.exit(0);
}

main().catch(console.error);

