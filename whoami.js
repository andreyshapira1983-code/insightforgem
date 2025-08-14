exports.handler = async () => {
  const mask = k => k ? k.slice(0,3) + '…' + k.slice(-4) : null;
  return {
    statusCode: 200,
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      OPENAI_KEY_EVAL: mask(process.env.OPENAI_KEY_EVAL),
      OPENAI_API_KEY:  mask(process.env.OPENAI_API_KEY),
      OPEN_API_KEY:    mask(process.env.OPEN_API_KEY)
    })
  };
};
