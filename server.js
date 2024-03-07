import express, { json } from 'express'

const APP_PORT = process.env.APP_PORT || 5000

const app = express()

app.use(json({
    extended: true
}))

app.get('/', (req, res) => {
    res.send('Hi!')
})

app.listen(APP_PORT, () => {
    console.log(`Server is ready for local development ast ${APP_PORT}`)
})
