import { Connection } from "server/framework/communication/Connection";
import { InputMessage } from "shared/framework/communication/messages";
import { MoveInputMessage, TurnInputMessage } from "shared/game/communication/messages";

export class TanksConnection extends Connection {
  public override handleInput(message: InputMessage): void {
    if (message instanceof MoveInputMessage) {
      this.chronology.addLeap(
        message.timeStamp,
        g => g.addPlayerMoveInput(this.id, message.directionState)
      )
    } else if (message instanceof TurnInputMessage) {
      this.chronology.addLeap(
        message.timeStamp,
        g => g.addPlayerTurnInput(this.id, message.direction)
      )
    }
  }
}