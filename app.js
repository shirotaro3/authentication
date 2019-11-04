const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const logger = require('morgan');
const FileStore = require('session-file-store')(expressSession);
const helmet = require('helmet');
const socketIo = require('socket.io');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const io = socketIo();
app.io = io

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// sessionの設定
const fileStoreOptions = {};
const session = (expressSession({
  secret: 'secretkey',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  store: new FileStore(fileStoreOptions),
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));
app.use(session);

// io-session config
const sharedsession = require('express-socket.io-session');
io.use(sharedsession(session, {
  autoSave: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// 認証用関数
const requireSignin = (req, res, next) => {
  if(req.session.user){
    next();
  }else{
    res.redirect('/users/login');
  }
}
app.use('/users', usersRouter);
app.use('/', requireSignin, indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', (socket) => {
  socket.user = socket.handshake.session.user
  io.emit('info logs', socket.user+'さんが入室しました。');

  socket.on('chat message', (msg) => {
    io.emit('chat message', socket.user+ "：" +msg);
  })

  // disconnect
  socket.on('disconnect', () => {
    io.emit('info logs', socket.user+'さんが退室しました。');
  })
})

module.exports = app;
