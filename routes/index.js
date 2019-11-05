const express = require('express');
const router = express.Router();
// セッションを確認するミドルウェア
const requireLogin = require('../middlewares/require-login')

/* GET home page. */
router.get('/', requireLogin, (req, res, next) => {
  res.render('index', { title: 'Chat room', user: req.session.user });
});
router.get('/about',requireLogin, (req, res, next) => {
  res.render('about', { title: 'About', user: req.session.user });
})

module.exports = router;
