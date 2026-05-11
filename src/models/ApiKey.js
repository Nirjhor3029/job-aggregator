const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['anonymous', 'free', 'paid'],
    default: 'free'
  },
  rateLimit: {
    type: Number,
    default: 300
  },
  rateLimitWindowMs: {
    type: Number,
    default: 60000
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUsedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

apiKeySchema.index({ active: 1 });

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function generateApiKey(prefix = 'sk') {
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `${prefix}_live_${randomPart}`;
}

apiKeySchema.statics.generateKey = async function (name, tier = 'free') {
  const rawKey = generateApiKey();
  const hashedKey = hashApiKey(rawKey);

  const tierLimits = {
    anonymous: { rateLimit: 30, rateLimitWindowMs: 60000 },
    free: { rateLimit: 300, rateLimitWindowMs: 60000 },
    paid: { rateLimit: 5000, rateLimitWindowMs: 60000 }
  };

  const limits = tierLimits[tier] || tierLimits.free;

  const apiKey = await this.create({
    name,
    apiKey: hashedKey,
    tier,
    rateLimit: limits.rateLimit,
    rateLimitWindowMs: limits.rateLimitWindowMs,
    active: true
  });

  return {
    _id: apiKey._id,
    name: apiKey.name,
    tier: apiKey.tier,
    rateLimit: apiKey.rateLimit,
    active: apiKey.active,
    key: rawKey,
    createdAt: apiKey.createdAt
  };
};

apiKeySchema.statics.validateKey = async function (rawKey) {
  if (!rawKey) return null;

  const hashedKey = hashApiKey(rawKey);
  const apiKey = await this.findOne({ apiKey: hashedKey, active: true });

  if (!apiKey) return null;

  await apiKey.updateOne({ lastUsedAt: new Date() });

  return {
    _id: apiKey._id,
    name: apiKey.name,
    tier: apiKey.tier,
    rateLimit: apiKey.rateLimit,
    rateLimitWindowMs: apiKey.rateLimitWindowMs
  };
};

apiKeySchema.statics.hashApiKey = hashApiKey;

module.exports = mongoose.model('ApiKey', apiKeySchema);
