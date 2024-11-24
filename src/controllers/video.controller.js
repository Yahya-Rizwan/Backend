import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"


const getAllVideos = asyncHandler(async (req, res) => {
   
    const userId = req.params.userId
    console.log(userId)
    try {
       
        const videos = await Video.aggregate([
            {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            },
           
        },{
            $sort:{
                createdAt : -1
            }
        }
        ])
       
        return res.status(200).json(new ApiResponse(200,videos,"successfully retrieved all videos"))
    } catch (error) {
        throw new ApiError(400,"problem in all videos try part");
    }
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async(req,res)=>{
    try {
        console.log(req.files.videoFile[0])
        const {title ,description} = req.body;
        const user = req.user;
        console.log(req.user)
        if(!user){
            throw new ApiError(400,"user is missing");
        }
        const videoPath = req.files.videoFile[0]?.path
        const thumbnailPath = req.files.thumbnail[0]?.path
    
        const videoFile = await uploadOnCloudinary(videoPath)
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
    
        const video = await Video.create({
            title,
            description,
            videoFile:videoFile.url,
            thumbnail : thumbnail.url,
            duration:videoFile.duration,
            views:0,
            isPublished:false,
            owner:user._id
        })
    
        const uploadedVideo = await Video.findById(video._id)
    
        if(!uploadedVideo){
            throw new ApiError(500,"something went wrong while uplaodning the video")
        }
    
        return res.status(200).json(
            new ApiResponse(200,uploadedVideo,"successfully created")
        )
    } catch (error) {
        throw new ApiError(500,error.message,"something went wring in try part")
    }
})
const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"didnt get the video by id")
    }

    return res.status(200).json(
        new ApiResponse(200,video,"video retrieved sucessfully")
    )
})

const updateVideo = asyncHandler(async(req,res)=>{
    console.log(req.body)
    const{title,description} = req.body
    const{videoId} = req.params
    const user = req.user
    const userId = user._id
    try {
        const video = await Video.findById(videoId)
      
        if(!video){
            throw new ApiError(500,"video not found with specific id")
        }
       
        if(video.owner.toString() != userId.toString()){
            return res.status(400).json(
                new ApiResponse(400,video,"unauthorized owner")
            )
        }
        
        let thumbnail = video.thumbnail
        
        if(req.files && req.files.thumbnail){
            
            const thumbnailpath = req.files.thumbnail[0].path
           
            if(thumbnailpath){
               thumbnail =  await uploadOnCloudinary(thumbnailpath)
               
               
            }
        }
        video.title = title || video.title
        video.description = description || video.description
        video.thumbnail = thumbnail
       

        const newV = await Video.findById(video._id);
        console.log(newV)
        await video.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200,newV,"video updated successfully"))
    } catch (error) {
        throw new ApiError(404,"error in try part ")
    }
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    const deleteVideoById = await Video.findByIdAndDelete(videoId)
    if(!deleteVideoById){
        new ApiError(404,"video is missing")
    }
  
    return res.status(200).json(200,deleteVideoById,"sucessfully deleted video by id")
})
const videosOnHomePage = asyncHandler(async(req,res)=>{
   try {
     
     const videos = await Video.aggregate([
         {
             $sort:{
                  createdAt:-1
             }
         }
     ])
     return res.status(200).json(new ApiResponse(200,videos,"all videos on homepage"))
   } catch (error) {
    console.log("lol")
   }
})
const incrementViews = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found")
    }
    video.views = video.views+1

    await video.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200,video,"succesfully incremented views"))

})
export {getAllVideos,publishVideo,getVideoById,updateVideo,deleteVideo,videosOnHomePage,incrementViews}