var _ = require('lodash');

const dummy = (blogs) =>{
    return 1
}

const totalLikes = (blogs) => {
    let sum = 0
    blogs.forEach(blog => {
        sum += blog.likes
    });
    return sum
}

const favoriteBlog = (blogs) => {
    let num = 0
    blogs.forEach(blog =>{
        if(blog.likes > num){
            num = blog.likes
        }
    })
    let res = {}
    blogs.forEach(blog => {
        if(blog.likes === num){
            res = blog
        }
    })
    return res
}

const mostBlogs = (blogs) => {
    let arr1 = _.groupBy(blogs, 'author')
    let arr2 = _.map(arr1, (v,k) => ({author:k,blogs:v.length}))
    let arr3 = _.orderBy(arr2, ['blogs', 'author'], ['desc', 'asc'])
    return arr3[0]
}

module.exports= {
    dummy, totalLikes, favoriteBlog, mostBlogs
}