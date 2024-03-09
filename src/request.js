import { check } from "express-validator"

const phoneRegex = /^[6789]\d{9}$/

const loginRequest = [
    check('phone')
        .notEmpty()
        .withMessage('phone field is required')
        .trim(),
    check('password')
        .notEmpty()
        .withMessage('password field is required')
        .trim()
]

const registerRequest = [
    check('name')
        .notEmpty()
        .withMessage('name field is required'),
    check('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('email field is not valid email'),
    check('phone')
        .notEmpty()
        .withMessage('phone field is required')
        .trim()
        .matches(phoneRegex)
        .withMessage('phone field is not valid number'),
    check('password')
        .notEmpty()
        .withMessage('password field is required')
        .trim()
        .isLength({ min:8 })
        .withMessage('password field should have at least 8 character length'),
]

export {
    loginRequest,
    registerRequest
}