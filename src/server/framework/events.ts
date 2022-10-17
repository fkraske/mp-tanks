import { Server, Socket } from 'socket.io'
import { Chronology } from '../../shared/framework/chronology/Chronology'
import { ClientEvent } from '../../shared/framework/communication/client'
import { ID } from '../../shared/framework/id/ID'
import { Morphable } from '../../shared/framework/morphable/Morphable'
import { Time } from '../../shared/framework/simulation/Time'

export function registerClientEvent<T, E extends Morphable<E>>(
  server: Server,
  socket: Socket,
  connectionID: ID,
  chronology: Chronology<E>,
  clientEvent: ClientEvent<T, E>
) {
  const room = connectionID.toString()

  socket.on(
    clientEvent.name,
    (message: T) => {
      setTimeout(
        () => {
          console.info('Received message \'' + clientEvent.name + '\' at: ' + Time.current)

          if (!clientEvent.checkType(message)) {
            console.warn('Received message is incomplete: ' + JSON.stringify(message))
            return
          }

          chronology.addTimeStampedLeap(clientEvent.getTimeStampedLeap(connectionID, message))
          server.except(room).emit(
            clientEvent.name,
            Object.assign({ connectionID: connectionID }, message)
          )
        },
        100
      )
    }
  )
}