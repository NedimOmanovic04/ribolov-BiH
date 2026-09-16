const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  dangerous: {
    disableTagCache: true,
    disableIncrementalCache: true,
  },
};

export default config;
