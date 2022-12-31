require('dotenv').config()

const PORT = process.env.PORT
const URL = process.env.NODE_ENV === 'test'   ? process.env.TEST_URL : process.env.URL

module.exports = {
  URL,
  PORT
}