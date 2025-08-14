const { detectedKeyNames, pickKey } = require('../netlify/functions/openai-keys');
console.log('foundEnvNames:', detectedKeyNames().join(','));
try {
  pickKey();
  console.log('roundRobinSample:true');
} catch (e) {
  console.log('roundRobinSample:false');
}
