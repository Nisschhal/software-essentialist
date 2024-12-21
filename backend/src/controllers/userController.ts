import { db } from "../db"
import { and, eq, ne, or } from "drizzle-orm"
import { users } from "../db/schema"

// Create User
export const createUser = async (req: any, res: any) => {
  const { email, username, firstName, lastName } = req.body

  // Check for non empty
  if (!email || !username || !firstName || !lastName) {
    return res.status(400).json({
      error: "ValidationError",
      data: undefined,
      success: false,
    })
  }

  // try catch block
  try {
    // check if user exist
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(username.username, username)))

    // if user or email exist return error
    if (existingUser.length > 0) {
      return res.status(409).json({
        error:
          existingUser[0].email === email
            ? "EmailAlreadyInUse"
            : "UsernameAlreadyTaken",
        data: undefined,
        success: false,
      })
    }

    // User doesn't exist so
    // generate randome Password
    const randomPassword = Math.random().toString(36).substring(2, 15)

    // save new User to db
    const newUser = await db
      .insert(users)
      .values({
        email,
        username,
        firstName,
        lastName,
        password: randomPassword,
      })
      .returning()

    // return success true with user data
    return res.status(201).json({
      error: undefined,
      data: newUser[0],
      success: true,
    })
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}

// GET USER BY EMAIL
export const getUserByEmail = async (req: any, res: any) => {
  const { email } = req.query

  try {
    const user = await db.select().from(users).where(eq(users.email, email))
    if (user.length === 0) {
      return res.status(404).json({
        error: "UserNotFound",
        data: undefined,
        success: false,
      })
    }

    return res.status(200).json({
      error: undefined,
      data: user[0],
      success: true,
    })
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}

// EDIT USER
export const editUser = async (req: any, res: any) => {
  const { userId } = req.params
  const { email, username, firstName, lastName } = req.body

  if (!email || !username || !firstName || !lastName) {
    return res.status(400).json({
      error: "ValidationError",
      data: undefined,
      success: false,
    })
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))

    if (user.length === 0) {
      return res.status(404).json({
        error: "UserNotFound",
        data: undefined,
        success: false,
      })
    }

    const conflicts = await db
      .select()
      .from(users)
      .where(
        and(
          or(eq(users.email, email), eq(users.username, username)),
          ne(users.id, Number(userId))
        )
      )

    if (conflicts.length > 0) {
      return res.status(409).json({
        error:
          conflicts[0].email === email
            ? "EmailAlreadyInUse"
            : "UsernameAlreadyTaken",
        data: undefined,
        success: false,
      })
    }

    const updatedUser = await db
      .update(users)
      .set({ email, username, firstName, lastName })
      .where(eq(users.id, Number(userId)))
      .returning()

    return res.status(200).json({
      error: undefined,
      data: updatedUser[0],
      success: true,
    })
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}
