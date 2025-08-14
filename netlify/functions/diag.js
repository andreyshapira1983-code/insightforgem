const { detectedKeyNames, pickKey } = require('./openai-keys');
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://insightforgem.netlify.app';

exports.handler = async () => {
  let rr = false;
  try {
    rr = !!pickKey();
  } catch (e) {
    rr = false;
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
    body: JSON.stringify({
      foundEnvNames: detectedKeyNames(),
      roundRobinSample: rr
    })
  };
};
