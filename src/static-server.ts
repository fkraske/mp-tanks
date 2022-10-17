import * as express from 'express'
import path from 'node:path'
import * as request from 'request'
import * as Constants from './server/constants'

const app = express.default()

app.use('/socket.io', (req, res) => {
  req.pipe(request.default(Constants.DOMAIN + ':' + Constants.SOCKET_IO_PORT + req.url)).pipe(res)
})

app.use(
  express.static(path.join(__dirname, '..', path.sep, 'dist'))
)

app.listen(Constants.STATIC_PORT, () => {
  console.info('Listening on port ' + Constants.STATIC_PORT)
})