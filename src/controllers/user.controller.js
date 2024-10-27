import {asyncHandler} from "../utils/asyncHandler.js"
import  {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { application } from "express"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId)=>{
     try {
         const user =  await User.findById(userId);
         const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()
          user.refreshToken = refreshToken
          user.save({validateBeforeSave:false})

          return {accessToken , refreshToken}
     } catch (error) {
          throw new ApiError(500,"something went wrong while generating refesh and access token")
     }
}
const registerUser = asyncHandler(async(req,res)=>{
     console.log(req.body);
     const{fullName,email,username,password} = req.body
        if(
         [fullName,email,username,password].some((field)=>
               field ?.trim() === "")
     ){
          throw new ApiError(400,"all fields are required")
     }

     const existedUser = await User.findOne({
          $or:[{username},{email}]
     })

     if(existedUser){
          throw new ApiError(409,"already existed")
     }
     
     const avatarLocalPath = req.files?.avatar[0]?.path;
    
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
          coverImageLocalPath = req.files.coverImage[0].path
     }
     if(!avatarLocalPath){
          throw new ApiError(400,"avatar not present 1")
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
          throw new ApiError(400,"avatar not present")
     }
    
     const user = await User.create({
          fullName,
          avatar: avatar.url,
          coverImage:coverImage?.url || "",
          email,
          password,
          username : username.toLowerCase()
     })
    
     const createdUser = await User.findById(user._id).select(
          "-password -refershToken "
     )
  
     if(!createdUser){
          throw new ApiError(500,"user creating problem");
     }

     return res.status(201).json(
          new ApiResponse(200,createdUser,"User registered succesfully")
     )
})
const loginUser = asyncHandler(async(req,res)=>{
     console.log(req.body);
     const{email,username,password} = req.body;
     if(!username && !email){
          throw new ApiError(400,"username or email is required");
     }

     const user = await User.findOne({
          $or: [{username},{email}]
     })

     if(!user){
          throw new ApiError(404,"user does not exist");
     }

     const isPasswordValid = await user.isPasswordCorrect(password)
     if(!isPasswordValid){
          throw new ApiError(401,"pass not valid");
     }

     const {accessToken ,refreshToken} =await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password  -refershToken")

    const options = {
     httpOnly : true,
     secure : true
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
     new ApiResponse(200,{
          user:loggedInUser,accessToken,refreshToken
     },"userlogged in successfully")
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
     console.log(req.body)
     await User.findByIdAndUpdate(
          req.user._id,
          {$set:{
               refreshToken: undefined
          }}
     )
     const options = {
          httpOnly : true,
          secure : true
     }
     return res.status(200).clearCookie("acessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"user logged out successfully"));

})



export {registerUser,loginUser,logoutUser}