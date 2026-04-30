const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors());

morgan.token('postData', function (req, res) {
    const data = JSON.stringify(req.body);
    return req.method === 'POST' ? data : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));


let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get('/', (request, response) => {
    response.status(204).end()
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('api/persons/info', (request, response) => {
    const people = persons.length;
    const now = new Date();
    const data = `<h1>Phonebook has info for ${people} people</h1>
    <p>${now}</p>`
    response.send(data);
})

app.post('/api/persons', (request, response) => {
    
    const name = request.body.name;
    const number = request.body.number;
    const id = Math.floor(Math.random() * 10000000000);
    const object = {
        id: id,
        name: name,
        number: number
    }
    const duplicateName = persons.filter(p => p.name === name)
    const duplicateNumber = persons.filter(p => p.number === number)
    // console.log(duplicateName.length);
    if (duplicateName.length) {
        return response.status(400).send("erro: The name is already exists in the phonebook")
    } else if (duplicateNumber.length) {
        return response.status(400).send("error: The number is already exists in the phonebook")
    } else {
        persons = persons.concat(object);
        return response.json(object);
        console.log(persons);
    }

})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== id);
    response.send(persons);
})



app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`)
})