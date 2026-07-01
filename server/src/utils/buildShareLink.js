const buildShareLink = (challengeId, view = '') => {
  const baseUrl = process.env.SHOPIFY_GAME_URL || process.env.CLIENT_URL || 'http://localhost:5170';
  const url = new URL(baseUrl);
  url.searchParams.set('challenge', challengeId);
  if (view) url.searchParams.set('view', view);
  return url.toString();
};
module.exports = buildShareLink;
