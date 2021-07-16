const app = require('./app')
const connect = require('./db/connect')

const PORT = process.env.PORT || 4000

// app.listen(PORT, () => {
//   connect()
//   console.log(`Server started at ${PORT} port`)
// })

const start = () => {
  try {
    connect()
    app.listen(PORT, () => console.log(`Server started at ${PORT} port`))
  } catch (error) {
    console.log(error)
  }
}

start()
