import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://rest-api-deploy.vercel.app'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})

// Metodos normales: GET, HEAD, POST
// Metodos complejos (preflight): PUT, DELETE, PATCH

// CORS Preflight
// OPTIONS
