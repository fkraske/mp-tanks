import { Server, Socket } from 'socket.io';
import { Chronology } from '../../shared/framework/chronology/Chronology';
import { Snapshot } from '../../shared/framework/chronology/Snapshot';
import { TimeStamp } from '../../shared/framework/chronology/TimeStamp';
import * as ServerEvents from '../../shared/framework/communication/server';
import * as IOEvents from '../../shared/framework/communication/socket-io';
import { Time } from '../../shared/framework/simulation/Time';
import * as ClientEvents from '../../shared/game/communication/client';
import { Game } from '../../shared/game/state/Game';
import * as Constants from '../constants';
import { registerClientEvent } from './events';

export class Match {
  public constructor(
    public readonly server: Server,
    public readonly room: string
  ) { }
  
  private readonly chronology = new Chronology<Game>(
    new Snapshot<Game>(
      Time.frame,
      new Game()
    )
  )
  private playerIDs = [1, 0]
  
  public get empty() {
    return this.playerIDs.length == 2
  }
  
  public get acceptsPlayer() {
    return !!this.playerIDs.length
  }

  public join(socket: Socket) {
    const id = this.playerIDs.pop()!
    const playerRoom = 'player-' + id.toString()

    socket.join(playerRoom)
    socket.join(this.room)
    socket.emit(ServerEvents.CONNECTION_ID, id)
    socket.emit(ServerEvents.INIT, this.chronology.get(Time.current))

    console.info('Connection on port ' + Constants.SOCKET_IO_PORT + ': ' + this.room + ', ' + playerRoom)

    for (const ev of ClientEvents.All)
      registerClientEvent<{ inputTime: TimeStamp }, Game>(
        this.server,
        socket,
        id,
        this.room,
        playerRoom,
        this.chronology,
        ev
      )
    
    socket.on(
      IOEvents.DISCONNECT,
      () => {
        console.info('Player with ID ' + id + ' disconnected')
        this.playerIDs.push(id)
      }
    )
  }

  public sendClientUpdate() {
    const time = Time.frame - Constants.CHRONOLOGY_DURATION
    this.chronology.trim(time)
    this.server.in(this.room).emit(
      ServerEvents.UPDATE_ROOT,
      this.chronology.get(time)
    )
  }
}