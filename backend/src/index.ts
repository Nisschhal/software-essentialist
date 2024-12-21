import express from "express"
import dotenv from "dotenv"
import usersRoutes from "./routes/userRoutes"

dotenv.config({ path: ".env.local" })

const app = express()
app.use(express.json())
app.use(usersRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
