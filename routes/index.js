const express = require('express');
const router = express.Router();
const io = require('socket.io');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Chat room', user: req.session.user });
});
module.exports = router;
