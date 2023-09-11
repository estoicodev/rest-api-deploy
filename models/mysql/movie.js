import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = {
  host: 'localhost', // La dirección del servidor MySQL
  user: 'root', // Tu nombre de usuario de MySQL
  port: 3306,
  password: 'root', // Tu contraseña de MySQL
  database: 'moviesdb' // El nombre de tu base de datos
}

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class MovieModel {
  static async getAll ({ genre, director }) {
    if (genre && director) {
      const lowerCaseGenre = genre.toLowerCase()
      const lowerCaseDirector = director.toLowerCase()
      // get movies that matches the director and genre
      const [movies] = await connection.query(
        'SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate FROM movie WHERE LOWER(director) = ? AND id IN (SELECT movie_id FROM movie_genres WHERE genre_id = (SELECT id FROM genre WHERE LOWER(name) = ?));', [lowerCaseDirector, lowerCaseGenre]
      )
      return movies
    } else if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre]
      )

      if (genres.length === 0) return []

      const [{ id: genreId }] = genres

      // get movies that matches the genre
      const [movies] = await connection.query(
        'SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate FROM movie WHERE id IN (SELECT movie_id FROM movie_genres WHERE genre_id = ?);', [genreId]
      )
      return movies
    } else if (director) {
      const lowerCaseDirector = director.toLowerCase()
      // get movies that matches the director
      const [movies] = await connection.query(
        'SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate FROM movie WHERE LOWER(director) = ?;', [lowerCaseDirector]
      )
      return movies
    }

    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate FROM movie;'
    )

    return movies
  }

  static async getById ({ id }) {
    const [movie] = await connection.query(
      `SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id]
    )
    return movie
  }

  static async create ({ input }) {
    const { title, year, director, duration, poster, rate, genre: inputGenre } = input
    const [uuidResults] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResults

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate)
          VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
        [uuid, title, year, director, duration, poster, rate]
      )
      inputGenre.forEach(async genre => {
        await connection.query(
          `INSERT INTO movie_genres (movie_id, genre_id)
            VALUES (UUID_TO_BIN(?), (SELECT id FROM genre WHERE name = ?));`,
          [uuid, genre]
        )
      })
    } catch (e) {
      throw new Error('Error creating movie')
    }

    const [newMovie] = await connection.query(
      `SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [uuid]
    )
    // get genres names by genre_id
    const [genres] = await connection.query(
      `SELECT name FROM genre
        WHERE id IN
        (SELECT genre_id FROM movie_genres
          WHERE movie_id = UUID_TO_BIN(?));`,
      [uuid]
    )

    // add genres to newMovie
    newMovie[0].genre = genres.map(genre => genre.name)

    return newMovie
  }

  static async update ({ id, input }) {
    const [movie] = await connection.query(
      `SELECT BIN_TO_UUID(id) as id, title, year, director, duration, poster, rate
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id]
    )

    if (movie.length === 0) return false

    const oldMovie = movie[0]

    const newMovie = {
      ...oldMovie,
      ...input
    }

    const { title, year, director, duration, poster, rate } = newMovie

    try {
      await connection.query(
        `UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ?
          WHERE id = UUID_TO_BIN(?);`,
        [title, year, director, duration, poster, rate, id]
      )
    } catch (e) {
      throw new Error('Error updating movie')
    }

    return newMovie
  }

  static async delete ({ id }) {
    try {
      const [deletedMovie] = await connection.query(
        'DELETE FROM movie WHERE id = UUID_TO_BIN(?);', [id]
      )
      if (deletedMovie.affectedRows === 0) return false
    } catch (e) {
      throw new Error('Error deleting movie')
    }
    return true
  }
}
