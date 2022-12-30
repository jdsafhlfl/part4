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

module.exports= {
    dummy, totalLikes, favoriteBlog
}