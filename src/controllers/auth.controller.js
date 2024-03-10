import prisma from "../prisma.js"
import config from "../config.js"
import { response } from "../utils/helper.js"
import bcrypt from 'bcrypt'
import { matchedData, validationResult } from "express-validator"
import jwt from 'jsonwebtoken'

const login = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)
        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: payload.phoneNumber
            }
        })

        let passwordResult = false;
        if (user) {
            passwordResult = await bcrypt.compare(payload.password, user.password)
        }

        if (!passwordResult) {
            return response(res, 'Incorrect credential, please try again', 401)
        }

        const {password, ...userPayload} = user

        jwt.sign(
            {
                userId: user.id
            },
            config.jwt_secret,
            {
                expiresIn: "24h"
            },
            (error, token) => {
                if (error) {
                    return response(res, 'Error with signing in, please contact administration!', 500)
                }
                return response(res, 'Login success', 200, {
                    userPayload,
                    token
                })
            }
        )
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const register = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)
        const checkIfUserExist = await prisma.user.findUnique({
            where: {
                phoneNumber: payload.phoneNumber
            }
        })
        if (checkIfUserExist) {
            return response(res, 'User already exist with given phone', 409)
        }
        payload['password'] = await bcrypt.hash(payload.password, config.jwt_salt)

        const newUser = await prisma.user.create({
            data: payload
        })
        return response(res, 'Register success', 201)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

export {
    login,
    register
}