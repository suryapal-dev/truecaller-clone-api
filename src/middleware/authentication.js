import config from "../config.js"
import jwt from 'jsonwebtoken'
import { getUser, response } from "../utils/helper.js"

const unauthorized = (res) => {
    return response(res, 'Unauthorized', 401)
}

const authentication = (req, res, next) => {
    const authHeader = req.headers['authorization'] || undefined
    const token = authHeader && authHeader.replace('Bearer ', '')
    if (!token) return unauthorized(res)

    jwt.verify(token, config.jwt_secret, async (error, userPayload) => {
        if (error) return unauthorized(res)

        const user = await getUser(userPayload.userId)
        if (!user) {
            return unauthorized(res)
        }

        req.loggedUser = user
        next()
    })
}

export default authentication