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
app.set('trust proxy', 'loopback')
app.use(express.static('views'))

const localnetworks = os.networkInterfaces().wlo1
const isLocal = localnetworks && localnetworks[0].address === '192.168.0.176' || false

const FILE_DIR = isLocal ? `/media/daniel/SSD 120GB/audiobook` : '/home/daniel/audiobook/static'

app.use(express.static(FILE_DIR));

app.post('/fingerprint', async (req, res) => {
    const {
        width, height, userAgent
    } = req.body

    const ipAddress = req.ip

    console.log({
        width, height, userAgent, ipAddress
    })

    res.json({
        width, height, userAgent, ipAddress
    })
})

app.get('/chapter/:book/:chapter', (req, res) => {
    const {
        book, chapter
    } = req.params

    const filePath = path.join(FILE_DIR, `${book}/${chapter}`)
    res.sendFile(filePath)
})

app.post('/progress', async (req, res) => {
    const {
        progress,
        chapter,
        book
    } = req.body

    const q0 = `SELECT Progress WHERE book="${book}"`
    const progresses = await database.query(q0)
    const _progress = progresses[0]

    if(_progress){
        const q1 = `UPDATE Progress SET chapter = "${chapter}", progress = ${progress} WHERE book = "${book}"`
        await database.query(q1)
    }else{
        const q2 = `INSERT INTO Progress (chapter, progress, book) VALUES ("${chapter}", ${progress}, "${book}")`
        await database.query(q2)
    }

    res.json({
        status: 200,
    })
})

app.get('/progress', async (req, res) => {
    const q0 = `SELECT * from Progress`;
    const progresses = await database.query(q0)

    res.json({
        status: 200,
        progresses,
    })
})

app.get('/progress/:book/', async (req, res) => {
    const {
        book, chapter
    } = req.params

    const q0 = `SELECT * FROM Progress WHERE book = "${book}" LIMIT 1`;
    const progresses = await database.query(q0)
    const progress = progresses[0]

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
