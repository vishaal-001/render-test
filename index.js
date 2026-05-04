require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())

morgan.token('postData', function (req, res) {
  const data = JSON.stringify(req.body)
  console.log('from morgan token res', res)
  return req.method === 'POST' ? data : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

app.get('/', (request, response) => {
  response.status(204).end()
})

app.get('/api/persons', (request, response, next) => {
  Person
    .find({}).then(result => {
      console.log('dbData:', result)
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/info', (request, response, next) => {
  const now = new Date()
  Person
    .find({})
    .then(people => {
      response.send(`<h1>Phonebook has info for ${people.length} people</h1>
            <p>${now}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findById(id)
    .then(person => {
      console.log(person)
      if (person) {
        return response.json(person)
      } else {
        return response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  console.log('req body::', request.body)

  const name = request.body.name
  console.log('Name::', name)
  const number = request.body.number
  console.log('Number::', number)

  if (!name || !number) {
    return response.status(400).json({ error: 'Data missing' })
  } else {
    const person = new Person({
      name: name,
      number: number,
    })
    person
      .save()
      .then(savedPerson => {
        console.log('DB_returns::', savedPerson)
        return response.json(savedPerson)
      })
      .catch(error => next(error))
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        person.name = name
        person.number = number

        return person
          .save()
          .then(updatedPerson => response.json(updatedPerson))
      } else {
        return response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person
    .findByIdAndDelete(id)
    .then(deletedPerson => {
      console.log('deletedPerson', deletedPerson)
      return response.json(deletedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error('from errorHandler', error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
// console.log("ENV PORT:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`)
})