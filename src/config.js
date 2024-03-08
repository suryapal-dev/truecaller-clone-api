import dotenv from 'dotenv'

dotenv.config()

const config = {
    port: parseInt(process.env.APP_PORT || '5000', 10)
}

export default config