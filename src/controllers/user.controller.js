import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req,res)=>{
    // Get User Data from Front-end
    // Validate the User Date  - no empty 
    // check if user already exists - email , Username
    // check images , avatar
    // upload them to cloudinary , check avatar
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response
    
    const {username , fullname , email , password} = req.body
    console.log("email: " , email)

    if([username, fullname , email, password].some((fields)=>{
        fields?.trim() ===''
    })){
        throw new apiError(404, "All fields are requried")
    }

    const existedUser = User.findOne({
        $or : [{username} , {email}]
    })
    if(existedUser){
        throw new apiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new apiError(400, 'avatar file is required')
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, 'avatar file is required')
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(createdUser){
        throw new apiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser , message = 'User registered Successfully')
    )

})

export {registerUser}