// NETPULSE Upload Worker — deploy this at Cloudflare Workers (free tier)
// This gives you a proper CORS-open upload endpoint at:
//   https://netpulse-upload.YOUR-NAME.workers.dev
//
// HOW TO DEPLOY (2 minutes, free):
//   1. Go to https://workers.cloudflare.com  → Sign up free
//   2. Click "Create a Worker"
//   3. Delete the default code, paste this entire file
//   4. Click "Save and Deploy"
//   5. Copy your worker URL e.g. https://netpulse-upload.xyz.workers.dev
//   6. In speedtest.html, add your worker URL as the FIRST entry in UPLOAD_TARGETS:
//      const UPLOAD_TARGETS = [
//        'https://netpulse-upload.YOUR-NAME.workers.dev/up',
//        'https://httpbin.org/post',
//        ...
//      ];

export default {
  async fetch(request) {
    // ── CORS preflight ────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
          'Access-Control-Max-Age':       '86400',
        },
      });
    }

    // ── Upload handler — drain body and discard ───────────────────
    if (request.method === 'POST') {
      // Drain the request body as fast as possible — this is what
      // makes the client's upload.onprogress fire correctly
      const reader = request.body?.getReader();
      let totalBytes = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
        }
      }

      return new Response(JSON.stringify({ received: totalBytes, ok: true }), {
        status: 200,
        headers: {
          'Content-Type':                 'application/json',
          'Access-Control-Allow-Origin':  '*',
          'Cache-Control':                'no-store',
        },
      });
    }

    return new Response('NETPULSE Upload Worker — POST data to /up', {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  },
};
