const express = require('express');
const passport = require('passport');
const router = express.Router();

// start auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // redirect to frontend with user info or set cookie
  res.redirect('http://localhost:3000/?auth=success');
});

// logout
router.get('/logout', (req, res) => {
  req.logout(() => {});
  req.session = null;
  res.redirect('http://localhost:3000/');
});

module.exports = router;
