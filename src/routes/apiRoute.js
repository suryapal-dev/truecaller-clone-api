import { Router } from "express"
import { login } from "../controller/auth.controller"

const router = Router()

router.get('/', (req, res) => {
    res.json({status: true})
})

router.post('/login', login)

export default router