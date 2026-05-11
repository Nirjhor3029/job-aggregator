const ApiKey = require('../models/ApiKey');

const requireApiKey = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];

  if (!apiKeyHeader) {
    return res.status(401).json({
      error: 'API key required. Provide x-api-key header.'
    });
  }

  const apiKeyInfo = await ApiKey.validateKey(apiKeyHeader);

  if (!apiKeyInfo) {
    return res.status(403).json({
      error: 'Invalid or inactive API key.'
    });
  }

  req.apiKey = apiKeyInfo;
  next();
};

const optionalApiKey = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];

  if (apiKeyHeader) {
    const apiKeyInfo = await ApiKey.validateKey(apiKeyHeader);
    if (apiKeyInfo) {
      req.apiKey = apiKeyInfo;
      return next();
    }
  }

  req.apiKey = {
    tier: 'anonymous',
    rateLimit: 30,
    rateLimitWindowMs: 60000
  };
  next();
};

module.exports = { requireApiKey, optionalApiKey };
