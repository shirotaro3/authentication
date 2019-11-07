module.exports = (req, res, next) => {
  if(req.session.user){
    res.clearCookie('ref')
    next();
  }else{
    res.cookie('ref', req.url);
    res.redirect('/users/login');
  }
}