const blogRouter = require('express').Router()
const Blog = require('../models/bloglist')
const User = require('../models/user')

blogRouter.get('',async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username:1, name:1})
    response.json(blogs)
})

blogRouter.post('', async (request, response) => {
    const body = request.body
    const userID = body.userId
    const user = await User.findOne({userID})
    if(!body.likes) body.likes = 0
    if(body.title && body.url){
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
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {

    const blog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
    }

    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new:true})
    response.json(updateBlog)
})

module.exports = blogRouter