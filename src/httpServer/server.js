import express, { json } from 'express'
import config from '../config.js'
import router from '../routes/apiRoute.js'

const app = express()

const execute = () => {
    app.use(json({
        extended: true
    }))
    app.use('*', router)
    app.listen(config.port, () => {
        console.log(`Server is ready for local development at ${config.port}`)
    })
}

const httpServer = {
    execute, app
}

export default httpServer
