const { detectedKeyNames, pickKey } = require('./openai-keys');

const ORIGIN = process.env.ALLOWED_ORIGIN || 'https://insightforgem.netlify.app';
const baseHeaders = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async (event = {}) => {
  const role = event.queryStringParameters?.role;
  const envKey = role ? process.env[`OPENAI_KEY_${role.toUpperCase()}`] : null;
  let rr = false;
  try {
    pickKey();
    rr = true;
  } catch {
    rr = false;
  }
  return {
    statusCode: 200,
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      foundEnvNames: detectedKeyNames(),
      roundRobinSample: rr,
      meta: { roleUsed: envKey ? role : null },
    }),
  };
};
