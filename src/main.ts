import { Server, Socket } from 'socket.io';
import * as Constants from './server/constants';
import { registerClientEvent } from './server/framework/events';
import { Chronology } from './shared/framework/chronology/Chronology';
import { Snapshot } from './shared/framework/chronology/Snapshot';
import { TimeStamp } from './shared/framework/chronology/TimeStamp';
import * as ServerEvents from './shared/framework/communication/server';
import * as IOEvents from './shared/framework/communication/socket-io';
import { Time } from './shared/framework/simulation/Time';
import * as ClientEvents from './shared/game/communication/client';
import { Game } from './shared/game/state/Game';



const chronology = new Chronology<Game>(
  new Snapshot<Game>(
    Time.frame,
    new Game()
  )
)
let playerIDs = [1, 0]

const server = new Server(
  Constants.PORT,
  {
    cors: {
      origin: "http://localhost:8000" //TODO needs to be somewhere more sensible
    }
  }
);

server.on(
  IOEvents.ESTABLISH_CONNECTION,
  (socket: Socket) => {
    if (playerIDs.length == 0) {
      socket.disconnect(true)
      console.info('A third player\'s connection request was denied')
      return
    }

    const id = playerIDs.pop()!
    const room = id.toString()

    socket.join(room)
    socket.emit(ServerEvents.CONNECTION_ID, id)
    socket.emit(ServerEvents.INIT, chronology.get(Time.current))

    console.info('Connection on port ' + Constants.PORT + '. Assigned ID: ' + id)

    for (const ev of ClientEvents.All)
      registerClientEvent<{ inputTime: TimeStamp }, Game>(
        server,
        socket,
        id,
        chronology,
        ev
      )
    
    socket.on(
      IOEvents.DISCONNECT,
      () => {
        console.info('Player with ID ' + id + ' disconnected')
        playerIDs.push(id)
      }
    )
  }
)

function updateConnections() {
  Time.update()
  const time = Time.frame - Constants.CHRONOLOGY_DURATION
  chronology.trim(time)
  server.emit(
    ServerEvents.UPDATE_ROOT,
    //TODO this is necessary to avoid overwriting client-side changes, that haven't
    //made it to the server yet. Still bad, if the latency exceeds CHRONOLOGY_DURATION
    chronology.get(time)
  )
}

setInterval(updateConnections, Constants.SERVER_TICK_RATE * 1000)