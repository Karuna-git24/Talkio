import jwt from "jsonwebtoken";
import User from '../MODELS/User.js';


export const protectRoute = async (req , res , next)=>{
   try{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
    const user = await User.findById(decoded.userid).select("-password");
    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    }
    req.user = user;
    next();
   }catch(error){
    console.log("Error in auth middleware", error);
    res.status(401).json({message:"Internal Server Error"});
   }
   
   
}