import express, { json } from 'express'
import config from '../config.js'
import { login, register } from "../controllers/auth.controller.js"
import { globalSearchRequest, loginRequest, registerRequest, reportRequest, detailRequest, updateUserRequest, updateContactRequest, createContactRequest } from '../request.js'
import { getUserDetails, globalSearch, me, updateUser } from '../controllers/user.controller.js'
import authentication from '../middleware/authentication.js'
import { report, unReport } from '../controllers/report.controller.js'
import { createContact, deleteContact, getContactDetail, updateContact } from '../controllers/contact.controller.js'

const app = express()

const execute = () => {
    app.use(json({ extended: true }))

    // ROUTES :: START
    app.post('/sign-up', registerRequest, register)
    app.post('/sign-in', loginRequest, login)

    app.get('/me', authentication, me)

    app.get('/users/:id', authentication, detailRequest, getUserDetails)
    app.patch('/users/:id', authentication, updateUserRequest, updateUser)

    app.post('/contacts', authentication, createContactRequest, createContact)
    app.get('/contacts/:id', authentication, detailRequest, getContactDetail)
    app.patch('/contacts/:id', authentication, updateContactRequest, updateContact)
    app.delete('/contacts/:id', authentication, detailRequest, deleteContact)

    app.post('/spam/mark', authentication, reportRequest, report)
    app.delete('/spam/unmark', authentication, reportRequest, unReport)

    app.get('/global-search', authentication, globalSearchRequest, globalSearch)
    // ROUTE :: END

    app.listen(config.port, () => {
        console.log(`Server is ready for local development at ${config.port}`)
    })
}

const httpServer = {
    execute
}

export default httpServer
