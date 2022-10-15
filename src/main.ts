import { Server, Socket } from 'socket.io';
import * as Constants from './server/constants';
import { Chronology } from './shared/framework/chronology/Chronology';
import { Leap } from './shared/framework/chronology/Leap';
import { Snapshot } from './shared/framework/chronology/Snapshot';
import { TimeStamped } from './shared/framework/chronology/TimeStamped';
import { IOEvents } from './shared/framework/communication/events';
import { AddLeapMessage, ClientMessage, InputMessage, RootUpdateMessage } from './shared/framework/communication/messages';
import { Time } from './shared/framework/simulation/Time';
import { MoveInputMessage, TurnInputMessage } from './shared/game/communication/messages';
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
  IOEvents.Builtin.ESTABLISH_CONNECTION,
  (socket: Socket) => {
    if (playerIDs.length == 0) {
      socket.disconnect(true)
      console.info('A third player\'s connection request was denied')
      return
    }

    const id = playerIDs.pop()!
    const room = id.toString()

    socket.join(room)

    console.info('Connection on port ' + Constants.PORT + '. Assigned id: ' + id)

    socket.on(
      IOEvents.CUSTOM,
      (payload: TimeStamped<ClientMessage>) => {
        console.info('Received message at: ' + payload.timeStamp)

        /*
        const m = payload.value

        if (m! instanceof InputMessage)
          return

        let leap: TimeStamped<Leap<Game>>

        if (m instanceof MoveInputMessage) {
          leap = new TimeStamped<Leap<Game>>(
            m.inputTime,
            g => g.addPlayerMoveInput(id, m.directionState)
          )
        } else if (m instanceof TurnInputMessage) {
          leap = new TimeStamped<Leap<Game>>(
            m.inputTime,
            g => g.addPlayerTurnInput(id, m.direction)
          )
        } else {
          return
        }

        chronology.addTimeStampedLeap(leap)
        server.except(room).emit(
          IOEvents.CUSTOM,
          new AddLeapMessage(leap)
        )
        */
      }
    )

    socket.on(
      IOEvents.Builtin.DISCONNECT,
      () => {
        console.info('Player with id ' + id + ' disconnected')
        playerIDs.push(id)
      }
    )
  }
)

function updateConnections() {
  Time.update()

  server.emit(
    IOEvents.CUSTOM,
    new RootUpdateMessage(
      chronology.get(Time.frame)
    )
  )
}

setInterval(updateConnections, Constants.TICK_RATE)