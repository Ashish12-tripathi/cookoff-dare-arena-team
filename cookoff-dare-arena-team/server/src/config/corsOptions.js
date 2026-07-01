const allowedOrigins = [
  "http://localhost:5170",
  "http://127.0.0.1:5170",
  process.env.CLIENT_URL,
  process.env.SHOPIFY_STORE_URL,
].filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    )
      return callback(null, true);
    console.log("CORS blocked origin:", origin);
    return callback(null, false);
  },
  credentials: true,
};
module.exports = corsOptions;
