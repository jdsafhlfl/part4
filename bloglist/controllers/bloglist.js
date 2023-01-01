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
    const userID = request.user
    const user = await User.findById(userID)
    if(!user){
        response.status(401).json({error:'unauthorized user'})
    }
    console.log(user)
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

    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    const userID = request.user
    if(!blog){
        response.status(400).json({error: 'bad request: the item has beem removed'})
    }
    else if(blog.user.toString() === userID){
        await Blog.findByIdAndRemove(request.params.id)
        const user = await User.findById(userID)
        // console.log(user.blogs)
        user.blogs = user.blogs.filter(blog => blog.toString() !== blogId)
        // console.log(user.blogs)
        user.save()
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