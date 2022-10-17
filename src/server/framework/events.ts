import { Server, Socket } from 'socket.io'
import { Chronology } from '../../shared/framework/chronology/Chronology'
import { ClientEvent } from '../../shared/framework/communication/client'
import { ID } from '../../shared/framework/id/ID'
import { Morphable } from '../../shared/framework/morphable/Morphable'
import { Time } from '../../shared/framework/simulation/Time'
import * as Constants from '../constants'

export function registerClientEvent<T, E extends Morphable<E>>(
  server: Server,
  socket: Socket,
  connectionID: ID,
  chronology: Chronology<E>,
  clientEvent: ClientEvent<T, E>
) {
  const room = connectionID.toString()

  function handleEvent(payload: T) {
    console.info('Received message \'' + clientEvent.name + '\' at: ' + Time.current)

    if (!clientEvent.checkType(payload)) {
      console.warn('Received message is incomplete: ' + JSON.stringify(payload))
      return
    }

    chronology.addTimeStampedLeap(clientEvent.getTimeStampedLeap(connectionID, payload))
    server.except(room).emit(
      clientEvent.name,
      Object.assign({ connectionID: connectionID }, payload)
    )
  }

  socket.on(
    clientEvent.name,
    (payload: T) => {
      if (Constants.FAKE_LATENCY as number === 0)
        handleEvent(payload)
      else
        setTimeout(
          () => { handleEvent(payload) },
          Constants.FAKE_LATENCY * 1000
        )
    }
  )
}