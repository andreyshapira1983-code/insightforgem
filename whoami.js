exports.handler = async () => {
  const m = k => k ? k.slice(0,3)+'…'+k.slice(-4) : null;
  return {
    statusCode: 200,
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      OPENAI_KEY_EVAL: m(process.env.OPENAI_KEY_EVAL),
      OPENAI_API_KEY:  m(process.env.OPENAI_API_KEY),
      OPEN_API_KEY:    m(process.env.OPEN_API_KEY)
    })
  };
};
