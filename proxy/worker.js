// ============================================
// VILLAGE WALLET API PROXY
// Cloudflare Worker — deploy for free at workers.cloudflare.com
// ============================================
// This proxy sits between your users and Etherscan.
// Users never send their IP to Etherscan.
// Your API key never touches the user's device.
// ============================================

const ETHERSCAN_API_KEY = ''; // Loaded from Worker secrets via env.ETHERSCAN_API_KEY // Move to Worker secrets in production
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';

// Allowed endpoints — only proxy what the app actually needs
const ALLOWED_MODULES = ['account', 'gastracker'];
const ALLOWED_ACTIONS = ['txlist', 'tokentx', 'gasoracle', 'balance'];

// Simple in-memory cache (Cloudflare Workers have per-request memory)
// For persistent cache, use Cloudflare KV (free tier: 100k reads/day)
const CACHE_TTL = {
  gasoracle: 15,    // 15 seconds for gas prices
  txlist: 60,       // 60 seconds for transaction history
  tokentx: 60,      // 60 seconds for token transactions
  balance: 30,      // 30 seconds for balance
};

export default {
  async fetch(request, env, ctx) {
    // CORS headers for your app
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === '/' || path === '/health') {
      return jsonResponse({
        status: 'ok',
        service: 'Village Wallet API Proxy',
        version: '1.0.0',
        privacy: 'Your IP is not forwarded to any third party',
      }, 200, corsHeaders);
    }

    // Main proxy endpoint: /api/etherscan
    if (path === '/api/etherscan') {
      return handleEtherscanProxy(url, corsHeaders, env, ctx);
    }

    // Gas price endpoint (convenience): /api/gas?chainId=1
    if (path === '/api/gas') {
      const chainId = url.searchParams.get('chainid') || url.searchParams.get('chainId') || '1';
      const proxyUrl = new URL(ETHERSCAN_BASE_URL);
      proxyUrl.searchParams.set('chainid', chainId);
      proxyUrl.searchParams.set('module', 'gastracker');
      proxyUrl.searchParams.set('action', 'gasoracle');
      proxyUrl.searchParams.set('apikey', env.ETHERSCAN_API_KEY || ETHERSCAN_API_KEY);

      return fetchAndReturn(proxyUrl.toString(), 'gasoracle', corsHeaders, ctx);
    }

    return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
  },
};

async function handleEtherscanProxy(url, corsHeaders, env, ctx) {
  // Extract and validate parameters
  const module = url.searchParams.get('module');
  const action = url.searchParams.get('action');
  const chainId = url.searchParams.get('chainid') || url.searchParams.get('chainId');

  // Validate required params
  if (!module || !action) {
    return jsonResponse({ error: 'Missing required parameters: module, action' }, 400, corsHeaders);
  }

  // Security: Only allow whitelisted modules and actions
  if (!ALLOWED_MODULES.includes(module)) {
    return jsonResponse({ error: `Module '${module}' not allowed` }, 403, corsHeaders);
  }
  if (!ALLOWED_ACTIONS.includes(action)) {
    return jsonResponse({ error: `Action '${action}' not allowed` }, 403, corsHeaders);
  }

  // Build the Etherscan URL — forward all params except apikey
  const proxyUrl = new URL(ETHERSCAN_BASE_URL);
  
  // Copy all query params from the request
  for (const [key, value] of url.searchParams.entries()) {
    if (key.toLowerCase() === 'apikey') continue; // Never forward user-supplied API keys
    proxyUrl.searchParams.set(key, value);
  }
  
  // Add our API key server-side
  proxyUrl.searchParams.set('apikey', env.ETHERSCAN_API_KEY || ETHERSCAN_API_KEY);

  return fetchAndReturn(proxyUrl.toString(), action, corsHeaders, ctx);
}

async function fetchAndReturn(proxyUrl, action, corsHeaders, ctx) {
  // Check Cloudflare cache first
  const cacheKey = new Request(proxyUrl);
  const cache = caches.default;
  
  let cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    // Return cached response with CORS headers
    const body = await cachedResponse.text();
    return new Response(body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }

  // Fetch from Etherscan
  try {
    const etherscanResponse = await fetch(proxyUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VillageWallet-Proxy/1.0',
      },
    });

    if (!etherscanResponse.ok) {
      return jsonResponse(
        { error: `Etherscan returned ${etherscanResponse.status}` },
        etherscanResponse.status,
        corsHeaders
      );
    }

    const data = await etherscanResponse.json();

    // Create cacheable response
    const ttl = CACHE_TTL[action] || 30;
    const response = new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttl}`,
        'X-Cache': 'MISS',
      },
    });

    // Store in Cloudflare cache (non-blocking)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to fetch from upstream', details: error.message },
      502,
      corsHeaders
    );
  }
}

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
