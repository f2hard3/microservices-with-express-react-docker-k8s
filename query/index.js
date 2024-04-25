const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const cors = require('cors');

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

const handleEvents = (type, data) => {
    if (type === 'PostCreated') {
        posts[data.id] = { ...data, comments: []}
    } 
    
    if (type === 'CommentCreated') {
        const { postId, ...comment } = data
        posts[postId].comments.push(comment)
    } 
    
    if (type === 'CommentUpdated') {
        const { postId, id } = data
        posts[postId].comments = posts[postId].comments.map(comment => {
            if (comment.id === id) return { ...comment, ...data }
            
            return comment
        })        
    }
}

app.get('/posts', (req, res) => {
    res.send(posts)
})

app.post('/events', (req, res) => {
    console.log('Event Received', req.body.type)

    const { type, data } = req.body

    handleEvents(type, data)

    res.send({})
})


app.listen(4002, async () => {
    console.log('Listening on 4002')

    try {
        const res = await axios.get('http://event-bus-srv:4005/events')

        res.data.forEach(event => {
            console.log('Processing event:', event.type)
            handleEvents(event.type, event.data)
        })
    } catch (error) {
        console.log(error.message)
    }
})