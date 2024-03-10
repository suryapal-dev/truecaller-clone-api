import { matchedData, validationResult } from "express-validator"
import prisma from "../prisma.js"
import { response, user, getUserByPhone } from "../utils/helper.js"

const checkIfAuthUserIsInDetailUserContact = async (userId, phoneNumber) => {
    const record = await prisma.contact.findUnique({
        where: {
            userId_phoneNumber: {
                userId,
                phoneNumber
            }
        }
    })

    if (record) {
        return true
    }
    return false
}

const getContactDetail = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const options = matchedData(req)
        const id = parseInt(options.id)

        const currentUser = user(req)

        const data = await prisma.contact.findUnique({
            where: {
                id: id
            }
        })

        if (!data) {
            return response(res, 'Not found', 404)
        }

        const userRecord = await getUserByPhone(data.phoneNumber)
        if (userRecord) {
            const isAddedInContact = await checkIfAuthUserIsInDetailUserContact(userRecord.id, currentUser.phoneNumber)
            if (!isAddedInContact && (userRecord.id !== currentUser.id)) {
                const {email, ...userData} = data
                return response(res, null, 200, userData)
            }
            data.email = userRecord.email
        }

        return response(res, null, 200, data)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const updateContact = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)
        const {id, ...contactPayload} = payload

        const contact = await prisma.contact.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!contact) {
            return response(res, 'Not found', 404)
        }

        const currentUser = user(req)

        if (contact.userId !== currentUser.id) {
            return response(res, 'Forbidden', 403)
        }

        if (contactPayload) {
            const updatedData = await prisma.contact.update({
                data: contactPayload,
                where: {
                    id: parseInt(id)
                }
            })
            return response(res, 'Updated', 200, updatedData)
        }
        return response(res, null, 200, contact)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const deleteContact = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)
        const id = payload.id

        const contact = await prisma.contact.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!contact) {
            return response(res, 'Not found', 404)
        }

        const currentUser = user(req)

        if (contact.userId !== currentUser.id) {
            return response(res, 'Forbidden', 403)
        }

        await prisma.contact.delete({
            where: {
                id: parseInt(id)
            }
        })
        return response(res, 'Deleted!', 200)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const createContact = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)

        const currentUser = user(req)

        const contact = await prisma.contact.findUnique({
            where: {
                userId_phoneNumber: {
                    userId: currentUser.id,
                    phoneNumber: payload.phoneNumber
                }
            }
        })

        if (contact) {
            return response(res, 'Contact already existed', 409)
        }

        payload.userId = currentUser.id

        const data = await prisma.contact.create({
            data: payload
        })
        return response(res, 'Created contact', 201, data)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

export {
    getContactDetail,
    updateContact,
    deleteContact,
    createContact
}
