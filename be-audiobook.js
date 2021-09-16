const express = require('express')
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const os = require('os')
const bodyParser = require('body-parser')
const database = require('./database')
const { exec } = require("child_process");
const app = express()
const PORT = 5000


app.use(cors())
app.use(bodyParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static('views'))

const localnetworks = os.networkInterfaces().wlo1
const isLocal = localnetworks && localnetworks[0].address === '192.168.0.176' || false

const FILE_DIR = isLocal ? `/media/daniel/SSD 120GB/audiobook` : '/home/daniel/audiobook/static'

app.use(express.static(FILE_DIR));


app.get('/chapter/:book/:chapter', (req, res) => {
    const {
        book, chapter
    } = req.params

    const filePath = path.join(FILE_DIR, `${book}/${chapter}`)
    res.sendFile(filePath)
})

let _progress = null
app.post('/progress', (req, res) => {
    const progress = {
        createdAt: Date.now(),
        ...req.body,
    }

    _progress = progress

    res.json({
        status: 200,
        progress
    })
})

app.get('/progress/:book/:chapter', (req, res) => {
    const {
        book, chapter
    } = req.params

    const progress = _progress

    res.json({
        status: 200,
        progress
    })
})

app.get('/books', (req, res) => {
    fs.readdir(FILE_DIR, (err, files) => {
        if (err) {
            console.log(err)
            res.json({
                status: 400,
                err: err
            })
        }
        else {
            res.json({
                status: 200,
                books: files
            })
        }
    })
})

app.get('/books/:title', (req, res) => {

    const { title } = req.params

    const titleDir = `${FILE_DIR}/${title}`

    fs.readdir(titleDir, (err, files) => {
        if (err) {
            console.error(err)
            res.json({
                status: 400,
                err: err
            })
        } else {
            const chapters = []
            let thumbnail = ''
            files.filter(file => {
                const extension = file.split('.').pop()
                if (extension === 'jpg' || extension === 'jpeg') {
                    thumbnail = file
                } else {
                    chapters.push(file)
                }
            })

            res.json({
                status: 200,
                chapters,
                thumbnail
            })
        }
    });
})

app.get('/photos', (req, res) => {

    fs.readdir(FILE_DIR, (err, files) => {
        if (err) {
            console.error(err)
            res.send(err)
        } else {
            res.json(files)

        }
    })
})

app.get('/thumbnail/:chapter/:file_name', (req, res) => {
    const { chapter, file_name } = req.params

    res.sendFile(FILE_DIR + '/' + chapter + '/' + file_name)
})

app.get('/', (req, res) => {
    res.send({ message: 'hello world from audiobook be' })
})

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})
