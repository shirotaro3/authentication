$(function iochat() {
  var socket = io();
  var user = '#{user}'
  console.log('hello')

  $('form').submit((e) => {
    e.preventDefault();
    socket.emit('chat message', ($('#m').val()));
    $('#m').val('');
    return false
  });
  socket.emit('set username', user);
  socket.on('info logs', (log) => {
    $('#messages').prepend($('<li class="info-log">').text(log));
  });
  socket.on('chat message', (msg) => {
    $('#messages').prepend($('<li>').text(msg));
  })
  socket.on('roster', (list) => {
    console.log(list)
    $('#roster').empty()
    list.forEach((name) => {
      $('#roster').prepend($('<li>').text(name))
    });
  });
});