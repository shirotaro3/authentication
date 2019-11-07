$(function iochat() {
  const socket = io();
  const user = $('#name').text()
  
  // 参加者リスト更新
  const updateRoster = (list) => {
    const currentRoom = $('#current-room').text();
    if(currentRoom === 'public'){
      $('.roster').hide();
    }else{
      $('.roster').show();
      $('#roster').empty();
      list.forEach((name) => {
        if(name !== user){
          $('#roster')
            .prepend($('<li class="'+name+'rosterli">')
            .prepend(
            ($('<span>').text(name)),
            ($('<button class="inv-btn" id="'+name+'">').text('+')))
          );
        };
      });
    }
  }

  // ルームメンバー更新
  socket.on('room members',(list) => {
    $('#room-members').empty();
    list.forEach((name) => {
      $('#room-members').prepend($('<li>').text(name+"さん"));
    });
  });

  // チャット送信
  $('#chat').submit((e) => {
    e.preventDefault();
    const currentRoom = $('#current-room').text();
    const message = $('#m').val();
    const data = {
      message: message,
      roomId: currentRoom
    }
    socket.emit('chat message', data);
    $('#m').val('');
    return false
  });

  // 退出メッセージ
  socket.on('leave log', (data) => {
    $('#messages').prepend($('<li class="info-log message">').text(data.userName+'さんが'+data.roomId+'から退室しました。'));
  });

  // チャット受信
  socket.on('chat message', (msg) => {
    if(user === msg.name){
      name = 'my-name'
    }else{
      name = 'name'
    }
    const className = msg.roomId.replace('@', '');
    $('#messages').prepend($('<li class="'+className+' message">').prepend(
      ($('<span class="info-log">').text("["+ msg.timeStamp+ "]　")),
      ($('<span>').addClass(name).text(msg.name+"：")),
      ($('<span class="text">').text(msg.text))
    ));
  });

  // ルーム作成(参加)リクエスト
  $('#new-room').submit((e) => {
    e.preventDefault();
    const roomId = $('#r').val();
    console.log(roomId)
    socket.emit('new room', roomId);
    $('#r').val('');
    return false
  })

  // 誰かがルームに加入した
  socket.on('join', (data) => {
    const className = data.roomId.replace('@', '');
    $('#messages').prepend($('<li class="info-log message '+className+'">').text(data.userName+'さんが'+data.roomId+'に入室しました。'));
    updateRoster(data.roster);
  })

  // 部屋移動に伴うルームログとルーム名の切り替え
  socket.on('room change',(roomId) => {
    const className = roomId.replace('@', '');
    $('#current-room').text(roomId);
    $('.message').hide(20, () => {
      $("." + className).show();
    });
  })

  // 招待したとき
  $(document).on('click','.inv-btn',function(e){
    e.preventDefault();
    const target = $(this).attr('id');
    $(this).remove();
    const invitation = {
      to: target,
      from: user,
      roomId: $('#current-room').text()
    }
    socket.emit('send invitation', invitation);
  })

  // 招待されたとき
  socket.on('send invitation', (data) => {
    $('#invitations').prepend($('<li>').prepend('['+data.from+']さんからルーム[<a href="#" class="inv-link">'+data.roomId+'</a>]に招待されました。'))
  })
  
  // 招待完了
  socket.on('receive', (data) => {
    const className = data.roomId.replace('@', '');
    $('#messages').prepend($('<li class="info-log message '+className+'">').text(''+data.to+'さんを'+data.roomId+'に招待しました。'))
  })

  // 招待を承諾
  $(document).on('click', '.inv-link',function(e){
    e.preventDefault();
    const roomId = $(this).text();
    socket.emit('accept invtation', roomId);
    console.log(roomId)
    return false;
  })

  // 参加者リスト更新
  socket.on('roster', (list) => {
    updateRoster(list);
  });

  // セッション切れ
  socket.on('redirect', (path) => {
    window.location.href = path;
  });

  // 他人ログイン
  socket.on('connect user', (userName) => {
    $('#roster')
      .prepend($('<li class="'+userName+'rosterli">')
      .prepend(
        ($('<span>').text(userName)),
        ($('<button class="inv-btn" id="'+userName+'">')
      .text('+'))));
  });

  // 他人ログアウト
  socket.on('disconnect user', (userName) => {
    $('.'+userName+'rosterli').remove();
  })
});