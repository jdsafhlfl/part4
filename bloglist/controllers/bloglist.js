const blogRouter = require('express').Router()
const Blog = require('../models/bloglist')
const User = require('../models/user')

const jwt = require('jsonwebtoken')


blogRouter.get('', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogRouter.post('', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {    
        return response.status(401).json({ error: 'token missing or invalid' })  
    }
    const userID = decodedToken.id
    const user = await User.findOne({ userID })
    if (!body.likes) body.likes = 0
    if (body.title && body.url) {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })
        const result = await blog.save()
        user.blogs = user.blogs.concat(result._id)
        await user.save()
        response.status(201).json(result)
    } else {
        response.status(400).end()
    }

})

blogRouter.delete('/:id', async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {    
        return response.status(401).json({ error: 'token missing or invalid' })  
    }
    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    if(blog.user.toString() === decodedToken.id){
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    }else{
        return response.status(403).json({error: 'Forbidden access'})
    }
})

blogRouter.put('/:id', async (request, response) => {

    const blog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
    }

    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updateBlog)
})

module.exports = blogRouter