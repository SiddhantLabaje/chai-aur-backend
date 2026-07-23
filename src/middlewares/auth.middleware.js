import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 console.log("Authorization Header:", req.header("Authorization"));
console.log("Cookie Token:", req.cookies?.accessToken);
console.log("Extracted Token:", token);
    if(!token){
     throw new ApiError(401,"Unauthorized request")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
     //next video Todo:discuss about frontnend
     throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user;
    next()
   } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
   }



})