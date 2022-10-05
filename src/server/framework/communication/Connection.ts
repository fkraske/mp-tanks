import { TimeStamped } from "shared/framework/chronology/TimeStamped";
import { ClientMessage, InputMessage } from "shared/framework/communication/messages";
import { ID } from "shared/framework/id/ID";
import { Time } from "shared/framework/simulation/Time";
import { Socket } from "socket.io";
import { Chronology } from "../../../shared/framework/chronology/Chronology";
import { IOEvents } from "../../../shared/framework/communication/events";
import { Constants } from "../../../shared/game/constants";
import { Game } from "../../../shared/game/state/Game";

export abstract class Connection {
  public constructor(
    public readonly id: ID,
    public readonly socket: Socket,
    public readonly chronology: Chronology<Game>
  ) {
    chronology.addLeap(Time.current, game => game.addPlayer(this.id))
    
    console.info('Connection on port ' + Constants.PORT + '. Assigned id: ' + this.id)
    
    socket.on(
      IOEvents.Custom.MESSAGE,
      (message: TimeStamped<ClientMessage>) => {
        console.info('Received message at: ' + message)

        if (message.value !instanceof InputMessage)
          return
        
        this.handleInput(message.value as InputMessage)
      }
    )

    socket.on(
      IOEvents.Builtin.DISCONNECT,
      () => {
        console.info('Player disconnected')
      }
    )
  }

  public abstract handleInput(message: InputMessage): void
}