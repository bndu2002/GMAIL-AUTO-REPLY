const express = require('express')
const route = require('./route/route')
const port = 3001
const app = express()


app.use('/', route)

app.listen(port, () => {
    console.log(`Express App running on port ${port}`)
})

//https://obsproject.com/welcome
