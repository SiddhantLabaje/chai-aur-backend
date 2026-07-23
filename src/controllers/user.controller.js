import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { use } from "react"


//generate Access And Refresh Tokens
const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating the access token and Refresh Token")
    }
}

// Register User
const registerUser=asyncHandler(async(req,res)=>
{
    console.log(req.body);
console.log(req.files);
    //todos
    //get user details from frontend
    //validation- not empty
    //check if user already exist: username, email
    //check for images ,check for avatar
    //upload them to cloudinary,avatar
    //create user object-create entry in DB
    //remove password and refresh token from response
    //check for user creation
    //return response

    
    //1)get user details from frontend

    const {fullName,email,username,password}=req.body
    console.log("email",email);

    //2)validation- not empty
    
    if(fullName===""){
        throw new ApiError(400,"fullname is required")

    }

    if(email===""){
        throw new ApiError(400,"email is required")

    }

    if(username===""){
        throw new ApiError(400,"username is required")

    }
    
    if(password===""){
        throw new ApiError(400,"password is required")

    }

    //3)check if user already exist: username, email
    
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User Already Existed")
    }

    //4)check for images ,check for avatar

   const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
     
    if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
    }

    //5)upload them to cloudinary,avatar
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
         throw new ApiError(400,"avatar file is required")
    }

    //6)create user object-create entry in DB

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })

    //7)remove password and refresh token from response
   
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

    //8)check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went Wrong while registring user")
    }

   //9)return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
})

//login User 
const loginUser=asyncHandler(async(req,res)=>{
    //todos
    //req body-> data(get data from request body)
    //username or email
    //find the user
    //check password 
    //generate access and refresh token
    //send both to user with secure cookies
    //send response "login successfully"

    //1)//req body-> data(get data from request body)
    const {email,username,password}=req.body
    if(!username && !email){
         throw new ApiError(400,"username or email required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"user not found")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password is Invalid")
    }
   const{accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

   const loggedInUser=await User.findById(user._id).
   select("-password -refreshToken")
   
   const options={
    httpOnly:true,
    secure:false
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User Logged in Successfully"
    )
)
})

// Logout User


const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new: true
        }
    )
     const options={
    httpOnly:true,
    secure:false
   }

   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"Logged Out Successfully"))
})

//Refresing Access Token 


const refreshAccessToken = asyncHandler(async(req,res)=>{
    
    const incomingrefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiError(401,"unauthorized request");
    }

    try {
       const decodedToken= jwt.verify(incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
    
        )
    
        const user=await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token");
        }
    
        if(incomingrefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
       const {accessToken,newrefreshToken} =await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,newrefreshToken},
                "Access token Refreshed"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})
//Writing update Controllers for user 

    //change Current Password
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    // if(!(newPassword===confPassword)){
    //     throw new ApiError(401,"PassWord does Not Match")
    // }

    const user=await constUser.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   
    if(!isPasswordCorrect){
        throw new ApiError(401,"Password Incorrect");
    }
   
    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Passsword Changed Successfully"))
})



//get Current useer

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched successfully");
})

//update the user account details (username and emails)
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName|| !email){
        throw new ApiError(400,"All fields are Requires") 
    }
    User.findByIdAndUpdate(
        req.user?._id,
    {
        $set:{
        fullName:fullName,
        email:email
        }
    },
{new:true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user,"Account Details Updated Successfully"))

})


//update User Avatar image 

const updateUserAvatar=asyncHandler(async(req,res)=>{

    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar Image Updated Successfully"))
})

//update cover Image 

const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover Image is missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"Error While Uploading cover Image")
    }
   const user= await User.findByIdAndUpdate(
       req.coverImage?.path,
       {
        $set:{
            coverImage:coverImage.url
        }
       },
       {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover Image Updated Successfully"))
})



export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage
}