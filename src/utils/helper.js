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

export {
    response
}