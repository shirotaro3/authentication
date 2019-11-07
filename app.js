const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const logger = require('morgan');
const FileStore = require('session-file-store')(expressSession);
const helmet = require('helmet');
const socketIo = require('socket.io');
const ioServer = require('./src/io-server')

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
app.use(cookieParser('secretkey'));

// sessionの設定
const fileStoreOptions = {};
const session = (expressSession({
  secret: 'secretkey',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
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


app.use('/users', usersRouter);
app.use('/', indexRouter);

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

// ioのサーバー側の操作
ioServer(io);

module.exports = app;
