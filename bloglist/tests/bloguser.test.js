const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('../tests/test_helper')


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'superuser', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'fullstack2022',
            name: 'fullstack',
            password: 'fullstackpasswd',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })
})

describe('when there is initially one user in db', () => {

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username must be unique')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toEqual(usersAtStart)
    })
  })

describe('test creating validation', () => {
    test('username must be given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          name: 'Superuser',
          password: 'salainen',
        }
  
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
  
        expect(result.body.error).toContain('`username` is required')
  
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('username minimum length is 3', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'hi',
          name: 'Superuser',
          password: 'salainen',
        }
  
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
  
        expect(result.body.error).toContain('minimum allowed length (3)')
  
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('password must be given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'hi',
          name: 'Superuser'
        }
  
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
  
        expect(result.body.error).toContain('password must be given')
  
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('password minimum length is 3', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'hi',
          name: 'Superuser',
          password: 'HI'
        }
  
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
  
        expect(result.body.error).toContain('minimum password length is 3')
  
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

afterAll(() => {
    mongoose.connection.close()
})