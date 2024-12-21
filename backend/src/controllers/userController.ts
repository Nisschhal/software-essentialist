import { db } from "../db"
import { and, eq, ne, or } from "drizzle-orm"
import { users } from "../db/schema"
import { Request, Response } from "express"

// Create User
export const createUser = async (req: Request, res: Response): Promise<any> => {
  const { email, username, firstName, lastName } = req.body

  // Check for non empty fields
  if (!email || !username || !firstName || !lastName) {
    return res.status(400).json({
      error: "ValidationError",
      data: undefined,
      success: false,
    })
  }

  try {
    // check if user exist
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    })

    // if user or email exist return error
    if (existingUser) {
      return res.status(409).json({
        error:
          existingUser.email === email
            ? "EmailAlreadyInUse"
            : "UsernameAlreadyTaken",
        data: undefined,
        success: false,
      })
    }

    // User doesn't exist so
    // generate random Password
    const randomPassword = Math.random().toString(36).substring(2, 15)
    // const hashedPassword = hashPassword(randomPassword)

    // save new User to db and return specified fields back as data
    const newUser = await db
      .insert(users)
      .values({
        email,
        username,
        firstName,
        lastName,
        password: randomPassword,
      })
      .returning({
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })

    // return success true with user data
    return res.status(201).json({
      error: undefined,
      data: newUser[0],
      success: true,
    })
  } catch (err) {
    console.error(err) // Log the error for debugging
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}

// EDIT USER
export const editUser = async (req: Request, res: Response): Promise<any> => {
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
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(userId)),
    })

    // NO USER FOUND
    if (!user) {
      return res.status(404).json({
        error: "UserNotFound",
        data: undefined,
        success: false,
      })
    }

    // USERNAME AND EMAIL CONFLICT
    const conflict = await db.query.users.findFirst({
      where: and(
        or(eq(users.email, email), eq(users.username, username)),
        ne(users.id, Number(userId))
      ),
    })

    // CONFLICT FOUND
    if (conflict) {
      return res.status(409).json({
        error:
          conflict.email === email
            ? "EmailAlreadyInUse"
            : "UsernameAlreadyTaken",
        data: undefined,
        success: false,
      })
    }

    // UPDATE USER
    const updatedUser = await db
      .update(users)
      .set({ email, username, firstName, lastName })
      .where(eq(users.id, Number(userId)))
      .returning({
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })

    return res.status(200).json({
      error: undefined,
      data: updatedUser[0],
      success: true,
    })
  } catch (error) {
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}

// GET USER BY EMAIL search query
export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const email = req.query.email as string
  try {
    // FIND USER BY EMAIL
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    // NO USER FOUND
    if (!user) {
      return res.status(404).json({
        error: "UserNotFound",
        data: undefined,
        success: false,
      })
    }

    //  USER FOUND
    return res.status(200).json({
      error: undefined,
      data: user,
      success: true,
    })
  } catch (err) {
    // SERVER ERROR
    return res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    })
  }
}
