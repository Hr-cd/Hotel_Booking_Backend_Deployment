import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/User.js'
import postRoutes from './routes/Post.js'
import categoryRoutes from './routes/Category.js'
import bookingRoutes from './routes/Booking.js'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
const app = express()
const port = 3000

dotenv.config()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(fileUpload({
  useTempFiles: true,          // required for tempFilePath
  tempFileDir: "/tmp/",        // or a custom temp folder
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
}));

//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Database connection
connectDB()

//routes
app.use('/api/auth', authRoutes)
app.use('/api/post', postRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/booking', bookingRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
