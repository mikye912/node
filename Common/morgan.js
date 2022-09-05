const morgan = require('morgan');
const common = require('$Common/common');
//require('dotenv').config()


const format = () => {
  const result = process.env.NODE_ENV === 'production' ? 'combined' : 'common'
  return result
}

const stream = { write: (message) => common.logger('info', message) }

const skip = (_, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.statusCode < 400
  }
  return false
}

const morganMiddleware = morgan(format(), { stream, skip })

module.exports = morganMiddleware