import { Connection } from "server/framework/communication/Connection";
import { InputMessage } from "shared/framework/communication/messages";
import { MoveInputMessage } from "shared/game/communication/messages";
import { Direction } from "shared/game/state/Direction";

export class TanksConnection extends Connection {
  public override handleInput(message: InputMessage): void {
    if (message instanceof MoveInputMessage) {
      if (message.direction == Direction.Up)
        this.chronology.addLeap(message.timeStamp, (snapshot) => )
      else if (message.direction == Direction.Right)
        throw new Error('//TODO not implemented')
      else if (message.direction == Direction.Down)
        throw new Error('//TODO not implemented')
      else if (message.direction == Direction.Left)
        throw new Error('//TODO not implemented')
    }
  }
}