import { TanksConnection } from 'server/game/communication/TanksConnection';
import { Chronology } from 'shared/framework/chronology/Chronology';
import { Snapshot } from 'shared/framework/chronology/Snapshot';
import { IOEvents } from 'shared/framework/communication/events';
import { ID } from 'shared/framework/id/ID';
import { Time } from 'shared/framework/simulation/Time';
import { Constants } from 'shared/game/constants';
import { Game } from 'shared/game/state/Game';
import { Server, Socket } from 'socket.io';

const idManager = new ID.Manager()
const chronology = new Chronology<Game>(
  new Snapshot<Game>(
    Time.frame,
    new Game()
  ),
  Constants.CHRONOLOGY_DURATION
)



const server = new Server(Constants.PORT);
server.on(
  IOEvents.Builtin.CONNECTION,
  (socket: Socket) => {
    const connectionID = idManager.create();

    new TanksConnection(connectionID, socket, chronology)
    socket.on(IOEvents.Builtin.DISCONNECT, () => idManager.destroy(connectionID))
  }
)