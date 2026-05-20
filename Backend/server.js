import authRoutes from './auth.route.js';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
import authuserRoutes from './auth.route.js';
import userRoutes from './user.rout.js';
import chatRoutes from './chat.route.js';
import { connectDB } from './lib/db.js';
import path from 'path';

const app = express();

const PORT = process.env.PORT ;

const __dirname = path.resolve();

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


    app.use(express.static(path.join(__dirname, "../Frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend","dist","index.html"));
    });


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});


    
