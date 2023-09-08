import express from 'express'
import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware())

app.use('/movies', moviesRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Go to /movies' })
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
