const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/bloglist')

const initialBlog = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

describe('initial test', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlog[0])
    await blogObject.save()
    blogObject = new Blog(initialBlog[1])
    await blogObject.save()
    blogObject = new Blog(initialBlog[2])
    await blogObject.save()
    blogObject = new Blog(initialBlog[3])
    await blogObject.save()
    blogObject = new Blog(initialBlog[4])
    await blogObject.save()
    blogObject = new Blog(initialBlog[5])
    await blogObject.save()
  })

  test('bloglist are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are six blog', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlog.length)
  })

  test('the first blog title is React patterns', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].title).toBe(initialBlog[0].title)
  })

  test('the unique identifier is id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
    expect(response.body[0]._id).not.toBeDefined()
  })

  test('a valid blog can be added', async () => {
    // await Blog.deleteMany({})
    const newBlog = {
      title: "hello world!",
      author: "linus",
      url: "https://****.com",
      likes: 999,
      userId: "63b18061daf2b878c177e37f"
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(blog => blog.title)

    expect(response.body).toHaveLength(initialBlog.length + 1)
    expect(titles).toContain(
      'hello world!'
    )
  })

  test('default likes set to 0', async () => {
    const newBlog = {
      title: "hello world!",
      author: "linus",
      url: "https://****.com",
      userId: "63b18061daf2b878c177e37f"
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlog.length + 1)
    expect(response.body[initialBlog.length].likes).toBe(0)

  })

  test('required title and url when post', async () => {
    const newBlog1 = {
      author: "linus",
      url: "https://****.com",
      userId: "63b18061daf2b878c177e37f"
    }

    const newBlog2 = {
      title: "hello world!",
      author: "linus",
      userId: "63b18061daf2b878c177e37f"
    }

    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400)

  })

  test('update blog', async () => {
    const updateBlog = initialBlog[1]
    updateBlog.likes = 10

    await api
      .put(`/api/blogs/${updateBlog._id}`)
      .send(updateBlog)

    const response = await api.get('/api/blogs')

    expect(response.body[1].likes).toBe(10)
  })

  test('delete one blog', async () => {
    const deleteBlog = initialBlog[0]

    await api
      .delete(`/api/blogs/${deleteBlog._id}`)
      .expect(204)

    const response = await api.get('/api/blogs')
    const title = response.body.map(blog => blog.title)
    expect(response.body).toHaveLength(initialBlog.length - 1)
    expect(title).not.toContain('React patterns')
  })
})

describe("token added verification for post", () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlog[0])
    await blogObject.save()
    blogObject = new Blog(initialBlog[1])
    await blogObject.save()
    blogObject = new Blog(initialBlog[2])
    await blogObject.save()
    blogObject = new Blog(initialBlog[3])
    await blogObject.save()
    blogObject = new Blog(initialBlog[4])
    await blogObject.save()
    blogObject = new Blog(initialBlog[5])
    await blogObject.save()
  })

  test('valid add', async () => {
    const newBlog = {
      title: "hello world!",
      author: "linus",
      url: "https://****.com",
    }

    const user = {username:'root', password:"secret"}
    const token_response = await api.post('/api/login').send(user)
    const token = token_response.text.split(',')[0].split("\"")[3]

    await api
      .post('/api/blogs')
      .set('Authorization','Bearer '+token)
      .send(newBlog)
      .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlog.length + 1)
    expect(response.body[initialBlog.length].likes).toBe(0)
    expect(response.body[initialBlog.length].author).toBe("linus")

  })
  test('invalid add', async () => {
    const newBlog = {
      title: "hello world!",
      author: "linus",
      url: "https://****.com",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlog.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})