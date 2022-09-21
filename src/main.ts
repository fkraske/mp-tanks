import * as io from 'socket.io'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080

const server = new io.Server(PORT);

server.on(
  'connection',
  (socket: io.Socket) =>
  {
    console.log('Connection on port ' + PORT)
  }
)