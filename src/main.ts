import assert = require('assert');
import { TanksConnection } from 'server/game/communication/TanksConnection';
import { Chronology } from 'shared/framework/chronology/Chronology';
import { Snapshot } from 'shared/framework/chronology/Snapshot';
import { IOEvents } from 'shared/framework/communication/events';
import { Time } from 'shared/framework/simulation/Time';
import { Constants } from 'shared/game/constants';
import { Game } from 'shared/game/state/Game';
import { Server, Socket } from 'socket.io';

const chronology = new Chronology<Game>(
  new Snapshot<Game>(
    Time.frame,
    new Game()
  ),
  Constants.CHRONOLOGY_DURATION
)
let players = 0



const server = new Server(Constants.PORT);
server.on(
  IOEvents.Builtin.CONNECTION,
  (socket: Socket) => {
    assert(players < 2)

    new TanksConnection(players, socket, chronology)
    ++players
    socket.on(IOEvents.Builtin.DISCONNECT, () => --players)
  }
)