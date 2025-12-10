module.exports = function(req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!key || key !== process.env.APP_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};
