import { check, param, query } from "express-validator"

const phoneNumberRegex = /^[6789]\d{9}$/

const loginRequest = [
    check('phoneNumber')
        .notEmpty()
        .withMessage('phoneNumber field is required')
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
    check('phoneNumber')
        .notEmpty()
        .withMessage('phoneNumber field is required')
        .trim()
        .matches(phoneNumberRegex)
        .withMessage('phoneNumber field is not valid number'),
    check('password')
        .notEmpty()
        .withMessage('password field is required')
        .trim()
        .isLength({ min:8 })
        .withMessage('password field should have at least 8 character length'),
]

const reportRequest = [
    check('phoneNumber')
        .notEmpty()
        .withMessage('phoneNumber field is required')
        .trim()
        .matches(phoneNumberRegex)
        .withMessage('phoneNumber field is not valid number')
]

const globalSearchRequest = [
    query('name_search')
        .optional()
        .isAlpha()
        .withMessage('name_search field can only contain alphanumeric characters'),
    query('phone_search')
        .optional()
        .isNumeric()
        .withMessage('phone_search field can only contain numeric characters')
]

const detailRequest = [
    param('id')
        .notEmpty()
        .withMessage('id field is required')
        .isNumeric()
        .withMessage('id field can only contain numeric characters'),
]

const updateUserRequest = [
    check('id')
        .notEmpty()
        .withMessage('id field is required')
        .isNumeric()
        .withMessage('id field can only contain numeric characters'),
    check('name')
        .optional(),
    check('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('email field is not valid email'),
    check('new_password')
        .optional()
        .trim()
        .isLength({ min:8 })
        .withMessage('new_password field should have at least 8 character length')
        .custom((value, { req }) => {
            if (req.body.old_password) {
                return true
            }
            return false
        })
        .withMessage('new_password field require old_password field to update'),
    check('old_password')
        .optional()
        .trim()
        .custom((value, { req }) => {
            if (req.body.old_password) {
                return true
            }
            return false
        })
        .withMessage('old_password field require new_password field to update'),
]

const updateContactRequest = [
    check('id')
        .notEmpty()
        .withMessage('id field is required')
        .isNumeric()
        .withMessage('id field can only contain numeric characters'),
    check('name')
        .optional(),
    check('phoneNumber')
        .optional()
        .trim()
        .matches(phoneNumberRegex)
        .withMessage('phoneNumber field is not valid number'),
]

const createContactRequest = [
    check('name')
        .notEmpty()
        .withMessage('name field is required'),
    check('phoneNumber')
        .notEmpty()
        .withMessage('phoneNumber field is required')
        .trim()
        .matches(phoneNumberRegex)
        .withMessage('phoneNumber field is not valid number'),
]

const contactSearchRequest = [
    query('name_search')
        .optional()
        .isAlpha()
        .withMessage('name_search field can only contain alphanumeric characters'),
    query('phone_search')
        .optional()
        .isNumeric()
        .withMessage('phone_search field can only contain numeric characters')
]

export {
    loginRequest,
    registerRequest,
    reportRequest,
    globalSearchRequest,
    detailRequest,
    updateUserRequest,
    updateContactRequest,
    createContactRequest,
    contactSearchRequest
}