module.exports = requireLogin = (req, res, next) => {
  if(req.session.user){
    res.clearCookie('ref')
    next();
  }else{
    // リクエストされたパスをクッキーに保存
    res.cookie('ref', req.url);
    console.log('redirect');
    res.redirect('/users/login');
  }
}