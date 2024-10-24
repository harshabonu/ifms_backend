import express from "express"; 
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import cors from "cors";  // Uncomment and configure if needed
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/user.js";
import { corsOptions } from "./constants/config.js"
dotenv.config({
    path: "./.env",
});

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB(mongoURI);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors()); // Enable preflight for all routes

// app.use(cors(corsOptions));  // Uncomment and configure if needed

// Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
