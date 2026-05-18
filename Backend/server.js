
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
import authRoutes from './auth.route.js';
import userRoutes from './user.rout.js';
import chatRoutes from './chat.route.js';
import { connectDB } from './lib/db.js';


const app = express();

const PORT = process.env.PORT ;
app.use(cookieParser());
app.set("etag", false);
app.use(cors({
    origin:  "http://localhost:5173",
    credentials:true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});


    
