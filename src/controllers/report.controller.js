import { matchedData, validationResult } from "express-validator"
import prisma from "../prisma.js"
import { response, user, incrementReportCount, decrementReportCount } from "../utils/helper.js"

const report = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }
        
        const payload = matchedData(req)
        const currentUser = user(req)

        if (currentUser.phoneNumber === payload.phoneNumber) {
            return response(res, 'You cannot mark yourself as spam', 409)
        }

        const alreadyReported = await prisma.report.findFirst({
            select: {
                userId: true
            },
            where: {
                userId: currentUser.id,
                phoneNumber: payload.phoneNumber
            }
        })
        if (alreadyReported) {
            return response(res, 'You have already reported the number.', 409)
        }

        const report = await prisma.report.create({
            data: {
                userId: currentUser.id,
                phoneNumber: payload.phoneNumber
            }
        })
        incrementReportCount(payload.phoneNumber)
        return response(res, 'Phone number reported!', 201, {
            report
        })
    } catch (error) {
        return response(res, error.message, 500)
    }
}

const unReport = async (req, res) => {
    try {
        const isValidated = validationResult(req)
        if (!isValidated.isEmpty()) {
            return response(res, null, 422, isValidated.array())
        }
        
        const payload = matchedData(req)
        const currentUser = user(req)

        const record = await prisma.report.findFirst({
            select: {
                userId: true,
                phoneNumber: true
            },
            where: {
                userId: currentUser.id,
                phoneNumber: payload.phoneNumber
            }
        })
        if (!record) {
            return response(res, 'Number is not reported by you.', 409)
        }

        await prisma.report.delete({
            where: {
                userId_phoneNumber: {
                    userId: record.userId,
                    phoneNumber: record.phoneNumber
                }
            }
        })
        decrementReportCount(payload.phoneNumber)
        return response(res, 'Successfully deleted!', 200)
    } catch (error) {
        return response(res, error.message, 500)
    }
}

export {
    report,
    unReport
}