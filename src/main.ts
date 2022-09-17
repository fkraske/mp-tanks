import * as socketio from 'socket.io'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080

const sio = new socketio.Server(PORT);

sio.on(
  'connection',
  (socket: socketio.Socket) =>
  {
    console.log('Connection on port ' + PORT)
  }
)