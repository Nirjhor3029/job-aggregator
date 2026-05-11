const rateLimit = require('express-rate-limit');

const DEFAULT_WINDOW_MS = 60 * 1000;

const TIER_LIMITS = {
  anonymous: {
    max: 30,
    windowMs: DEFAULT_WINDOW_MS
  },
  free: {
    max: 300,
    windowMs: DEFAULT_WINDOW_MS
  },
  paid: {
    max: 5000,
    windowMs: DEFAULT_WINDOW_MS
  }
};

function normalizeIp(ip) {
  if (!ip) return 'unknown';
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
}

const tieredLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: (req) => {
    if (req.apiKey && req.apiKey.tier) {
      if (req.apiKey.rateLimit) {
        return req.apiKey.rateLimit;
      }
      return TIER_LIMITS[req.apiKey.tier]?.max || TIER_LIMITS.anonymous.max;
    }
    return TIER_LIMITS.anonymous.max;
  },
  message: (req) => {
    const tier = req.apiKey?.tier || 'anonymous';
    const limit = req.apiKey?.rateLimit || TIER_LIMITS[tier]?.max || TIER_LIMITS.anonymous.max;
    return {
      error: `Rate limit exceeded. Tier '${tier}' is limited to ${limit} requests per minute.`
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    if (req.apiKey && req.apiKey._id) {
      return `key_${req.apiKey._id.toString()}`;
    }
    return `ip_${normalizeIp(req.ip)}`;
  }
});

module.exports = {
  tieredLimiter,
  TIER_LIMITS
};
