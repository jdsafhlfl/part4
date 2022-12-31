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

module.exports = blogRouter