import { Router } from "express"
import {
  createUser,
  editUser,
  getUserByEmail,
} from "../controllers/userController"

const router = Router()

router.post("/users/new", createUser)
router.post("/users/edit/:userId", editUser)
router.get("/users", getUserByEmail)

export default router
