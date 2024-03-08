import { Router } from "express"

const router = Router()

router.get('/', (req, res) => {
    res.json({status: true})
})

router.post('/login', (req, res) => {})

export default router