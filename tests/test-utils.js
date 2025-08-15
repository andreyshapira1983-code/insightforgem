export const run = async (name, fn) => {
  try {
    await fn();
    console.log('\u2713', name);
  } catch (e) {
    console.error('\u2717', name, e);
    process.exitCode = 1;
  }
};
