import { matchedData, validationResult } from "express-validator"
import prisma from "../prisma.js"
import { getSpamCount, response, user, getUser, getBooleanOfMarkedSpamByCurrentUser } from "../utils/helper.js"
import bcrypt from 'bcrypt'
import config from "../config.js"

const me = (req, res) => {
    return response(res, null, 200, user(req))
}

const getUserByName = async (currentUser, name_search) => {
    let response = []
    const startWithUser = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phoneNumber: true,
        },
        where: {
            NOT: {
                id: {
                    equals: currentUser.id
                }
            },
            name: {
                startsWith: name_search,
                mode: "insensitive"
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    const startWithContact = await prisma.contact.findMany({
        select: {
            id: true,
            userId: true,
            name: true,
            phoneNumber: true,
        },
        where: {
            NOT: {
                phoneNumber: {
                    equals: currentUser.phoneNumber
                }
            },
            name: {
                startsWith: name_search,
                mode: "insensitive"
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    if (startWithUser) {
        response = response.concat(startWithUser)
    }
    if (startWithContact) {
        response = response.concat(startWithContact)
    }

    const containsUser = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phoneNumber: true,
        },
        where: {
            NOT: {
                OR: [
                    {
                        id: {
                            equals: currentUser.id
                        },
                    },
                    {
                        name: {
                            startsWith: name_search,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            name: {
                contains: name_search,
                mode: "insensitive"
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    const containsContact = await prisma.contact.findMany({
        select: {
            id: true,
            userId: true,
            name: true,
            phoneNumber: true,
        },
        where: {
            NOT: {
                OR: [
                    {
                        phoneNumber: {
                            equals: currentUser.phoneNumber
                        },
                    },
                    {
                        name: {
                            startsWith: name_search,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            name: {
                contains: name_search,
                mode: "insensitive"
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    if (containsUser) {
        response = response.concat(containsUser)
    }
    if (containsContact) {
        response = response.concat(containsContact)
    }
    return response
}

const getUserByPhone = async (currentUser, phone_search) => {
    let response = []
    const equalUser = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phoneNumber: true,
        },
        where: {
            NOT: {
                id: {
                    equals: currentUser.id
                }
            },
            phoneNumber: {
                equals: phone_search,
                mode: "insensitive"
            }
        },
        orderBy: {
            name: "asc"
        }
    })

    if (equalUser && equalUser.length) {
        response = response.concat(equalUser)
    } else {
        console.debug('jejr')
        const containsUser = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
            },
            where: {
                NOT: {
                    id: {
                        equals: currentUser.id
                    }
                },
                phoneNumber: {
                    contains: phone_search,
                    mode: "insensitive"
                }
            },
            orderBy: {
                name: "asc"
            }
        })
        const containsContact = await prisma.contact.findMany({
            select: {
                id: true,
                userId: true,
                name: true,
                phoneNumber: true,
            },
            where: {
                phoneNumber: {
                    contains: phone_search,
                    mode: "insensitive"
                }
            },
            orderBy: {
                name: "asc"
            }
        })
        if (containsUser) {
            response = response.concat(containsUser)
        }
        if (containsContact) {
            response = response.concat(containsContact)
        }
    }
    return response
}

const usersList = async (currentUser, name_search = null, phone_search = null) => {
    if (!name_search && !phone_search) return []

    let response = []
    if (name_search) {
        response = await getUserByName(currentUser, name_search)
    } else {
        response = await getUserByPhone(currentUser, phone_search)
    }

    if (response) {
        for (const item of response) {
            item.spamCount = await getSpamCount(item.phoneNumber)
        }
    }

    return response
}

const globalSearch = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const options = matchedData(req)
        const name_search = options.name_search || null
        const phone_search = options.phone_search || null

        const currentUser = user(req)

        const users = await usersList(currentUser, name_search, phone_search)

        return response(res, null, 200, users)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

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

const getUserDetails = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const options = matchedData(req)
        const id = options.id

        const currentUser = user(req)

        const data = await getUser(id)

        if (!data) {
            return response(res, 'Not found', 404)
        }

        const canUserShowEmail = await checkIfAuthUserIsInDetailUserContact(data.id, currentUser.phoneNumber)

        data.spamCount = await getSpamCount(data.phoneNumber)
        data.markedSpamByYou = await getBooleanOfMarkedSpamByCurrentUser(currentUser.id, data.phoneNumber)

        if (!canUserShowEmail && (currentUser.id !== data.id)) {
            delete data.email
            return response(res, null, 200, data)
        }

        return response(res, null, 200, data)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const updateUser = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }

        const payload = matchedData(req)
        const {id, ...userPayload} = payload

        const currentUser = user(req)

        if (parseInt(id) !== currentUser.id) {
            return response(res, 'Forbidden', 403)
        }

        const dUser = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!dUser) {
            return response(res, 'Not found', 404)
        }

        if (('new_password' in userPayload) && ('old_password' in userPayload)) {
            const passwordResult = await bcrypt.compare(userPayload.old_password, dUser.password)

            if (!passwordResult) {
                return response(res, 'Incorrect credential, please try again', 401)
            }

            userPayload.password = await bcrypt.hash(userPayload.new_password, config.jwt_salt)
            delete userPayload.old_password
            delete userPayload.new_password
        }

        if (userPayload) {
            const updatedData = await prisma.user.update({
                data: userPayload,
                where: {
                    id: parseInt(id)
                }
            })
            delete updatedData.password
            return response(res, 'Updated', 200, updatedData)
        }
        delete dUser.password
        return response(res, null, 200, dUser)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

export {
    me,
    globalSearch,
    getUserDetails,
    updateUser
}