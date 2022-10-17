import { Server, Socket } from 'socket.io';
import * as Constants from './server/constants';
import { Match } from './server/framework/Match';
import * as IOEvents from './shared/framework/communication/socket-io';
import { Time } from './shared/framework/simulation/Time';



const server = new Server(
  Constants.SOCKET_IO_PORT,
  {
    cors: {
      origin: 'http://' + Constants.DOMAIN + ':' + Constants.STATIC_PORT
    }
  }
);

let matches: Match[] = []
let maxMatchID = 0

server.on(
  IOEvents.ESTABLISH_CONNECTION,
  (socket: Socket) => {
    for (const m of matches)
      if (m.acceptsPlayer) {
        m.join(socket)
        return
      }

    const m = new Match(server, 'match-' + maxMatchID.toString())
    m.join(socket)
    matches.push(m)
    ++maxMatchID
  }
)

function updateMatches() {
  Time.update()
  matches = matches.filter(m => !m.empty)
  
  for (const m of matches)
    m.sendClientUpdate()
}

setInterval(updateMatches, Constants.SERVER_TICK_RATE * 1000)