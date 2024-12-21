import { Router, Request, Response } from "express"
import {
  createUser,
  editUser,
  getUserByEmail,
} from "../controllers/userController"
import { db } from "../db"
import { and, eq, ne, or } from "drizzle-orm"
import { users } from "../db/schema"

const router = Router()

router.post("/users/new", createUser)
router.post("/users/edit/:userId", editUser)
router.get("/users", getUserByEmail)

export default router
