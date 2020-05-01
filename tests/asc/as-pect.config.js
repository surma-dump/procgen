module.exports = {
  include: ["./tests/asc/*.ts"],
  disclude: [/.*\.d\.ts$/],
  flags: {
    "--runtime": ["half"]
  }
};
