const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')


const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared')
  console.log(helper.bigBlog)
  const blogObjects = helper.bigBlog
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  const length = helper.bigBlog.length
  console.log(length)
  expect(response.body).toHaveLength(length)
},5000)

test('existence of the id attribute', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    expect(blog._id).toBeDefined})
})

test ('adding a new blog post', async () => {
  const newBlog = {
    title: 'The newest book',
    author: 'Tom and Jerry',
    url: 'www.mysite.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type',/application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)
  expect(response.body).toHaveLength(helper.bigBlog.length + 1)
  expect(contents).toContain('The newest book')
})

test('blog post with no likes property defaults to zero' , async () => {
  const newBlog = {
    title: 'The Blog with no likes',
    author: 'some developer',
    url: 'www.realwebsite.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type',/application\/json/)

  const response = await api.get('/api/blogs')

  const content = response.body.filter(blog => blog.title === 'The Blog with no likes')
  console.log(content)
  expect(content[0].likes).toBe(0)
})

test('blog post with title and url missing' , async () => {
  const newBlog = {
    author: 'me',
    likes: 12
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

})

afterAll(() => {
  mongoose.connection.close()
})