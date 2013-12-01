var PORT = 1234;

var io = require('socket.io').listen(PORT);

var users = {}; // store login users

io.sockets.on('connection', function (socket) {

  function disconnect() {

    socket.get('userId', function (err, userId) {

      console.log('Disconnected: ' + userId);
      delete users[userId];

      socket.broadcast.emit('system', {from: 'system', msg: userId + ' logout.'});

      // update online users
      var list = [];
      for (var key in users) {
        list.push(key);
      }

      socket.broadcast.emit('list', {list: list});
      console.log('broadcast: disconnect');
    });

  }

  socket.on('login', function (data) {

    users[data.userId] = socket;
    socket.set('userId', data.userId);

    console.log('Register: ' + data.userId);

    socket.emit('system', {from: 'system', msg: data.userId + ' login.'});
    socket.broadcast.emit('system', {from: 'system', msg: data.userId + ' login.'});

    // update online users
    var list = [];
    for (var key in users) {
      list.push(key);
    }

    socket.emit('list', {list: list});
    socket.broadcast.emit('list', {list: list});
  });

  socket.on('disconnect', disconnect);  // for detect offline from socket
  socket.on('disconnectByUser', disconnect);

  socket.on('send', function (data) {
    socket.get('userId', function (err, userId) {
      socket.broadcast.emit('chat', {from: userId, msg: data.msg});
    });
  });

});