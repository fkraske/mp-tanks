import { Chronology } from "../../../shared/framework/chronology/Chronology";
import { Socket } from "socket.io";
import { Game } from "../../../shared/game/model/Game";
import { Events, IOEvents } from "../../../shared/framework/communication/events";
import { Constants } from "../../../shared/game/constants";
import { ClientMessage, InputMessage, Message } from "shared/framework/communication/messages";
import { Morphable } from "shared/framework/morphable/Morphable";

export abstract class Connection<T extends Morphable<T>> {
  public constructor(
    public readonly socket: Socket,
    public readonly chronology: Chronology<Game>
  ) {
    console.info('Connection on port ' + Constants.PORT)
    
    socket.on(
      Events.MESSAGE,
      (message: ClientMessage) => {
        console.info('Received message: ' + message)

        if (message !instanceof InputMessage)
          return
        
        this.handleInput(message)
      }
    )

    socket.on(
      IOEvents.DISCONNECT,
      () => {
        console.info('Player disconnected')
      }
    )
  }

  public abstract handleInput(message: InputMessage): void
}