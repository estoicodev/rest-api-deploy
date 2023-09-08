import { randomUUID } from 'node:crypto'
import { readJSON } from '../utils.js'
const movies = readJSON('./movies.json')

export class MovieModel {
  static async getAll ({ genre, director }) {
    let filteredMovies

    if (genre && director) {
      filteredMovies = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) &&
        movie.director.toLowerCase() === director.toLowerCase()
      )
    } else if (genre) {
      filteredMovies = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    } else if (director) {
      filteredMovies = movies.filter(
        movie => movie.director.toLowerCase() === director.toLowerCase()
      )
    } else {
      return movies
    }
    return filteredMovies
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return movie
  }

  static async create ({ input }) {
    const newMovie = {
      id: randomUUID(), // uuid v4
      ...input
    }

    // Esto no es REST porque estamos guardando en memoria
    movies.push(newMovie)

    return newMovie
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)

    return true
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }

    return movies[movieIndex]
  }
}
