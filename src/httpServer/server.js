import express, { json, urlencoded } from 'express'
import config from '../config.js'
import { login, register } from "../controllers/auth.controller.js"
import { globalSearchRequest, loginRequest, registerRequest, reportRequest, detailRequest, updateUserRequest, updateContactRequest, createContactRequest, contactSearchRequest } from '../request.js'
import { getUserDetails, globalSearch, me, updateUser } from '../controllers/user.controller.js'
import authentication from '../middleware/authentication.js'
import { report, unReport } from '../controllers/report.controller.js'
import { createContact, deleteContact, getContactDetail, getMyContact, updateContact } from '../controllers/contact.controller.js'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import helmet from 'helmet'
import xss from 'xss-clean'
import compression from 'compression'

const app = express()

const myOrigins = [
    "http://localhost:3000"
]

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        message: "Too many requests",
        statusCode: 429
    },
    validate: {
        xForwardedForHeader: false
    }
})

const execute = () => {
    app.use(helmet.crossOriginResourcePolicy({
        policy: 'cross-origin'
    }))
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)

            if (myOrigins.indexOf(origin) === -1) {
                return callback(new Error('Origin does not have access from CORS policy for this site.'), false)
            }
            return callback(null, true)
        }
    }))
    app.use(xss())
    app.use(compression())
    app.use(rateLimiter)
    app.use(urlencoded({ extended: true }))
    app.use(json({ extended: true }))

    // ROUTES :: START
    app.post('/sign-up', registerRequest, register)
    app.post('/sign-in', loginRequest, login)

    app.use(authentication)

    app.get('/me', me)

    app.get('/users/:id', detailRequest, getUserDetails)
    app.patch('/users/:id', updateUserRequest, updateUser)

    app.get('/contacts', contactSearchRequest, getMyContact)
    app.post('/contacts', createContactRequest, createContact)
    app.get('/contacts/:id', detailRequest, getContactDetail)
    app.patch('/contacts/:id', updateContactRequest, updateContact)
    app.delete('/contacts/:id', detailRequest, deleteContact)

    app.post('/spam/mark', reportRequest, report)
    app.delete('/spam/unmark', reportRequest, unReport)

    app.get('/global-search', globalSearchRequest, globalSearch)
    // ROUTE :: END

    app.listen(config.port, () => {
        console.log(`Server is ready for local development at ${config.port}`)
    })
}

const httpServer = {
    execute
}

export default httpServer
