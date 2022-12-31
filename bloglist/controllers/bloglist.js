const blogRouter = require('express').Router()
const Blog = require('../models/bloglist')

blogRouter.get('',async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.post('', async (request, response) => {
    const blog = new Blog(request.body)
    if(!blog.likes) blog.likes = 0
    if(blog.title && blog.url){
        const result = await blog.save()
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