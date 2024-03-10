import prisma from "../prisma.js"

const response = (res, message = null, status = 200, data = null) => {
    const resObj = {
        message,
        statusCode: status
    }
    if (resObj && (status === 200 || status === 201)) {
        resObj['data'] = data
    } else if (resObj && (status === 422 || status === 500)) {
        if (status === 422) {
            resObj['message'] = 'Validation Error'
        }
        resObj['errors'] = data
    }
    return res.status(status).json(resObj)
}

const user = (req) => {
    return req.loggedUser || null
}

const getUser = async (id) => {
    id = Number(id)
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    if (!user) {
        return null
    }
    delete user.password
    return user
}

const getUserByPhone = async (phoneNumber) => {
    const user = await prisma.user.findUnique({
        where: {
            phoneNumber
        }
    })
    if (!user) {
        return null
    }
    delete user.password
    return user
}

const incrementReportCount = async (phoneNumber) => {
    const record = await prisma.reportCount.findUnique({
        select: {
            spamCount: true
        },
        where: {
            phoneNumber
        }
    })

    if (!record) {
        await prisma.reportCount.create({
            data: {
                phoneNumber,
                spamCount: 1
            }
        })
        return true
    }
    await prisma.reportCount.update({
        where: {
            phoneNumber
        },
        data: {
            spamCount: (record.spamCount || 0) + 1
        }
    })
    return true
}

const decrementReportCount = async (phoneNumber) => {
    const record = await prisma.reportCount.findUnique({
        select: {
            spamCount: true
        },
        where: {
            phoneNumber
        }
    })

    if (!record) {
        return true
    }
    await prisma.reportCount.update({
        where: {
            phoneNumber
        },
        data: {
            spamCount: record.spamCount ? record.spamCount - 1 : 0
        }
    })
    return true
}

const getSpamCount = async (phoneNumber) => {
    const record = await prisma.reportCount.findUnique({
        select: {
            spamCount: true
        },
        where: {
            phoneNumber
        }
    })

    if (record) {
        return record.spamCount
    }

    return 0
}

const getBooleanOfMarkedSpamByCurrentUser = async (userId, phoneNumber) => {
    const record = await prisma.report.findUnique({
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

export {
    response,
    user,
    getUser,
    incrementReportCount,
    decrementReportCount,
    getSpamCount,
    getUserByPhone,
    getBooleanOfMarkedSpamByCurrentUser
}