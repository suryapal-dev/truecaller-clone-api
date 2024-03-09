import express, { json } from 'express'
import config from '../config.js'
import { login, register } from "../controllers/auth.controller.js"
import { loginRequest, registerRequest } from '../request.js'

const app = express()

const execute = () => {
    app.use(json({ extended: true }))

    // ROUTES :: START
    app.post('/signup', registerRequest, register)

    app.post('/signin', loginRequest, login)
    // ROUTE :: END

    app.listen(config.port, () => {
        console.log(`Server is ready for local development at ${config.port}`)
    })
}

const httpServer = {
    execute, app
}

export default httpServer
