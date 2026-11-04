import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return{accessToken,refreshToken}

    }
    catch(error){
        throw new apiError(500, "something went wrong while generating access and refresh token")
    }
}

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
    
    const {username , fullName , email , password} = req.body
    console.log("email: " , email)

    if([username, fullName , email, password].some((fields)=>{
        return fields?.trim() ===''
    })){
        throw new apiError(404, "All fields are requried")
    }

    const existedUser = await User.findOne({
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
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser ,'User registered Successfully')
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    // req body -> data
    // username or email
    // password check
    // access and refresh token
    // send cookies

    const {email , username , password} = req.body

    if(!username && !password){
        throw new apiError(404, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apiError(404, "User not found ! ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!user){
        throw new apiError(401, "Password Incorrect  ")
    }

    if(!isPasswordValid){
        throw new apiError(404 , "password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
        new apiResponse(200,
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
        "user Logged in successfully"
    )
    )

})

export {registerUser,loginUser}