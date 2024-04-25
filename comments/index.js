const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors');
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
    const { id: postId } = req.params
    res.send(commentsByPostId[postId] ?? [])
})

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body
    const { id: postId } = req.params
    const comments = commentsByPostId[postId] ?? []
    const comment = { id: commentId, content, status: 'pending' }
    comments.push(comment)    
    commentsByPostId[postId] = comments

    const event = {
        type: 'CommentCreated',
        data: { ...comment, postId  }
    }

    await axios.post('http://event-bus-srv:4005/events', event).catch((err) => {
        console.log(err.message)
    })

    res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
    console.log('Event Received', req.body.type)

    const { type, data } = req.body

    if (type === 'CommentModerated') {
        const { postId, id, status } = data
        const comment = commentsByPostId[postId].find(comment => comment.id === id)
        comment.status = status

        const event = {
            type: 'CommentUpdated',
            data: { ...comment, postId }
        }
    
        await axios.post('http://event-bus-srv:4005/events', event).catch((err) => {
            console.log(err.message)
        })
    }

    
        
    res.send({})
})

app.listen(4001, () => {
    console.log('Listening on 4001')
})