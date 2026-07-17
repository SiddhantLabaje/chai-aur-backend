import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser=asyncHandler(async(req,res)=>
{
    console.log(req.body);
console.log(req.files);
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

export {registerUser}