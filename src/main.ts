import { Server, Socket } from 'socket.io';
import * as Constants from './server/constants';
import { Chronology } from './shared/framework/chronology/Chronology';
import { Leap } from './shared/framework/chronology/Leap';
import { Snapshot } from './shared/framework/chronology/Snapshot';
import { TimeStamped } from './shared/framework/chronology/TimeStamped';
import { Input } from './shared/framework/communication/messages';
import * as ServerEvents from './shared/framework/communication/server/events';
import * as IOEvents from './shared/framework/communication/socket.io/events';
import { Time } from './shared/framework/simulation/Time';
import * as ClientEvents from './shared/game/communication/client/events';
import { MoveInputMessage, TurnInputMessage } from './shared/game/communication/client/messages';
import { Game } from './shared/game/state/Game';

const chronology = new Chronology<Game>(
  new Snapshot<Game>(
    Time.frame,
    new Game()
  ),
  Constants.CHRONOLOGY_DURATION
)
let playerIDs = [1, 0]

const server = new Server(
  Constants.PORT,
  {
    cors: {
      origin: "http://localhost:5173" //TODO make port constant
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

    console.info('Connection on port ' + Constants.PORT + '. Assigned ID: ' + id)

    //TODO move the leap creation part to shared
    //TODO generalize
    //TODO move to abstract subclass for message registrators
    function registerMessageType<T extends Input>(
      socket: Socket,
      event: string,
      selector: (message: T) => any[] = (_) => [],
      handler: (message: T) => Leap<Game>
    ) {
      socket.on(
        event,
        (message: T) => {
          console.info('Received message at: ' + Time.current)

          if (message.inputTime === undefined || selector(message).some(m => m === undefined)) {
            console.warn('Received message is incomplete: ' + JSON.stringify(message))
            return
          }

          let leap = new TimeStamped<Leap<Game>>(message.inputTime, handler(message))
          chronology.addTimeStampedLeap(leap)
          server.except(room).emit(
            ServerEvents.LEAP,
            { leap: leap }
          )
        }
      )
    }

    registerMessageType<MoveInputMessage>(
      socket,
      ClientEvents.INPUT_MOVE,
      m => [m.directionState],
      m => g => g.addPlayerMoveInput(id, m.directionState)
    )

    registerMessageType<TurnInputMessage>(
      socket,
      ClientEvents.INPUT_TURN,
      m => [m.direction],
      m => g => g.addPlayerTurnInput(id, m.direction)
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

  server.emit(
    ServerEvents.UPDATE_ROOT,
    { state: chronology.get(Time.frame) }
  )
}

setInterval(updateConnections, Constants.TICK_RATE)