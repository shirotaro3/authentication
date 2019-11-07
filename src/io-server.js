// IOのサーバー側の操作

module.exports = (io) => {

  io.on('connection', (socket) => {

    socket.userName = socket.handshake.session.user
    socket.use((packet, next) => {
      if(socket.handshake.session.user){return next();}
      io.to(socket.id).emit('redirect', '/users/login');
    });

    // [roster]招待リストの作成+更新
    const updateRoster = () => {
      const roster = getRoster();
      io.emit('roster', roster);
    };

    // [roster]招待リスト作成(userNameの配列)
    const getRoster = () => {
      const roomMembers = getRoomMembers(socket.current);
      const clients = io.of('/').connected;
      let ro = [];
      for(key in clients){
        if(roomMembers.includes(clients[key].userName)){}else{
          ro.unshift(clients[key].userName);
        }
      }
      return roster = Array.from(new Set(ro));
    }

    // [roomMember]ルームの参加者一覧を更新
    const updateRoomMembers = () => {
      const roomMembers = getRoomMembers(socket.current);
      io.to(socket.current).emit('room members', roomMembers);
      if(socket.prev){
        const prevMembers = getRoomMembers(socket.prev);
        io.to(socket.prev).emit('room members', prevMembers);
        socket.prev = false
      }
    }

    // [roomMember]ルームの参加者一覧を作成
    const getRoomMembers = (roomId) => {
      const clients = io.of('/').connected;
      const rooms = socket.adapter.rooms;
      let room;
      for(key in rooms){
        if(key == roomId){
          room = rooms[key]
        }
      }
      return extractRoomMembers(room, clients);
    }

    // [roomMember]全クライアントの中からルーム内にいる人の情報だけを取り出す
    const extractRoomMembers = (room, clients) => {
      let roomMembers = [];
      if(room){
        var roomKeys = Object.keys(room.sockets)
      }else{
        var roomKeys = []
      }
      for(key in clients){
        if(roomKeys.includes(key)){
          roomMembers.unshift(clients[key].userName);
        }
      }
      return roomMembers = Array.from(new Set(roomMembers));
    }

    // [userName => userId]名前からIDを特定
    const searchByName = (name) => {
      const clients = io.of('/').connected;
      let target;
      for(key in clients){
        if(name === clients[key].userName){
          target = clients[key]
        }
      }
      return target
    }

    // [join]部屋を移動するときの処理
    const joinTheRoom = (roomId) => {
      if(socket.current){
        socket.leave(socket.current)
        socket.prev = socket.current
        io.to(socket.prev).emit('leave log', {userName: socket.userName,roomId: socket.prev})
      };
      socket.join(roomId);
      socket.current = roomId;
      const roster = getRoster();
      const data = {
        roomId: roomId,
        roster: roster,
        userName: socket.userName
      }
      updateRoomMembers();
      io.to(socket.id).emit('room change', data.roomId);
      io.to(roomId).emit('join', data);
    }

    // チャット発言を拡散
    socket.on('chat message', (data) => {
      if(data.message.trim() !== ""){
        const now = new Date();
        const hh = ('0'+now.getHours()).slice(-2);
        const mm = ('0'+now.getMinutes()).slice(-2);
        const timeStamp = (hh + ':' + mm);
        const msg = {
          timeStamp: timeStamp,
          name: socket.userName,
          text: data.message.slice(0,20),
          roomId: data.roomId
        }
        io.to(data.roomId).emit('chat message', msg);
      }
    });

    // 部屋への新規作成・参加
    socket.on('new room', (roomId) => {
      if(roomId.trim() === ''){
        roomId = 'public'
      }else{
        roomId = (roomId.slice(0,8) + "@"+socket.userName);
      }
      if(roomId !== socket.current){
        joinTheRoom(roomId);
      }
    })

    // 招待
    socket.on('send invitation', (data) => {
      const target = searchByName(data.to);
      io.to(target.id).emit('send invitation', data);
      io.to(socket.id).emit('receive', data);
    });

    // 招待を承諾
    socket.on('accept invtation', (roomId) => {
      if(roomId !== socket.current){
        joinTheRoom(roomId);
      }
    })

    // 接続開始時
    if(!socket.handshake.session.user){
      io.to(socket.id).emit('redirect', '/users/login');
    }
    joinTheRoom('public');
    updateRoster();
    updateRoomMembers();
    

    // 切断時
    socket.on('disconnect', () => {
      updateRoster();
      updateRoomMembers();
      if(socket.current){
        io.to(socket.current).emit('leave log', {userName: socket.userName,roomId: socket.current})
      };
    });
  });
};