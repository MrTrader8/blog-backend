const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')

beforeEach(async() => {
  await User.deleteMany({})
  console.log('cleared')
})

describe('adding users' , () => {
  test('user is added properly', async() => {
    const newUser = {
      username: 'TestUser1',
      name: 'Person One',
      password: 'password123'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type',/application\/json/)

    const response = await api.get('/api/users')

    const contents = response.body[0]
    expect(contents.username).toContain('TestUser1')
    expect(contents.name).toContain('Person One')
  })

  test('adding the same user', async() => {
    const newUser = {
      username: 'TestUser1',
      name: 'Person One',
      password: 'password123'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type',/application\/json/)

    const response = await api.get('/api/users')

    const contents = response.body
    expect(contents).toHaveLength(1)
  })

  test('adding user with username not valid', async() => {
    const newUser = {
      username: 'Me',
      name: 'Person One',
      password: 'password123'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })

  test('adding user with password not valid', async() => {
    const newUser = {
      username: 'TestUser3',
      name: 'Person One',
      password: '1'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect({ error: 'password must be at least 3 characters' })
  })
})

afterAll(() => {
  mongoose.connection.close()
})