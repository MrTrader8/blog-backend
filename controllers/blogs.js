const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id){
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    url: body.url,
    likes: body.likes,
    author: body.author,
    user: user._id

  })
  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog)
    await user.save()
    response.json(savedBlog)
  } catch(exception) {
    next(exception)
  }
})

blogRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id){
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blogid = request.params.id
  const blog = await Blog.findById(blogid)

  if(blog.user.toString() === decodedToken.id){
    await Blog.findByIdAndDelete(blogid)
    response.status(204).end()
  } else {
    return response.status(401).json({
      error: 'Unauthorized access'
    })
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const blog = new Blog(request.body)

  try{
    const savedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(savedBlog)
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogRouter