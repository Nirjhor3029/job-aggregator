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
  keyGenerator: (req) => {
    if (req.apiKey && req.apiKey._id) {
      return `key_${req.apiKey._id.toString()}`;
    }
    return `ip_${req.ip}`;
  }
});

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  tieredLimiter,
  globalApiLimiter,
  TIER_LIMITS
};
