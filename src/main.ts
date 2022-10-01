import { TanksConnection } from 'server/game/communication/TanksConnection';
import { Chronology } from 'shared/framework/chronology/Chronology';
import { Snapshot } from 'shared/framework/chronology/Snapshot';
import { IOEvents } from 'shared/framework/communication/events';
import { Time } from 'shared/framework/simulation/Time';
import { Constants } from 'shared/game/constants';
import { Game } from 'shared/game/model/Game';
import { Server, Socket } from 'socket.io';

const chronology = new Chronology<Game>(
  new Snapshot<Game>(
    Time.frame,
    new Game()
  ),
  Constants.CHRONO_LEN
)



const server = new Server(Constants.PORT);
server.on(
  IOEvents.CONNECTION,
  (socket: Socket) => { new TanksConnection(socket, chronology) }
)