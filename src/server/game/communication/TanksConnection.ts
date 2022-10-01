import { Connection } from "server/framework/communication/Connection";
import { InputMessage } from "shared/framework/communication/messages";
import { MoveInputMessage } from "shared/game/communication/messages";
import { Direction } from "shared/game/model/Direction";
import { Game } from "shared/game/model/Game";

export class TanksConnection extends Connection<Game> {
  public handleInput(message: InputMessage): void {
    if (message instanceof MoveInputMessage) {
      if (message.direction == Direction.UP)
        throw new Error('//TODO not implemented')
      else if (message.direction == Direction.RIGHT)
        throw new Error('//TODO not implemented')
      else if (message.direction == Direction.DOWN)
        throw new Error('//TODO not implemented')
      else if (message.direction == Direction.LEFT)
        throw new Error('//TODO not implemented')
    }
  }
}