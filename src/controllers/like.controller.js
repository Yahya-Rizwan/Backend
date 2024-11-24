import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Likes } from "../models/likes.models.js";
import mongoose from "mongoose";
import { Comment } from "../models/comments.models.js";


const toggleLikeVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    const userId = req.user._id
    const existingLike = await Likes.find({
        $and:[
            { video: new mongoose.Types.ObjectId(videoId)},
            {likedBy: userId}
        ]
})
     if(existingLike[0]){
         const delteLike = await Likes.findByIdAndDelete(existingLike[0]._id)
         return res.status(200).json(new ApiResponse(200,{},"like removed"))
     }

     const like = await  Likes.create({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: userId
     })

     return res.status(200).json(new ApiResponse(200,like,"liked video success"))
})
const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment not found")
    }
    const userId = req.user._id
    const existingLike = await Likes.find({
        $and:[
            { comment: new mongoose.Types.ObjectId(commentId)},
            {likedBy: userId}
        ]
})
     if(existingLike[0]){
         const delteLike = await Likes.findByIdAndDelete(existingLike[0]._id)

         return res.status(200).json(new ApiResponse(200,{},"like removed"))
     }

     const like = await  Likes.create({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: userId
     })

     return res.status(200).json(new ApiResponse(200,like,"liked comment success"))
})

const totalLikes = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const totali = await Likes.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $count: "likes"
        }
    ])
     console.log(totali)
    return res.status(200).json(new ApiResponse(200,totali,"total likes fetched"))
})
const likeStatus = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId
    const userId = req.user._id


    const statusLike = await Likes.find({
        
            $and:[
                {video: new mongoose.Types.ObjectId(videoId)},
                {likedBy : userId}
            ]
        
})
    if(statusLike[0]){
        return res.status(200).json(new ApiResponse(200,true,"Liked by user"))
    }

    return res.status(200).json(new ApiResponse(200,false,"not liked by user"))
})
export {toggleLikeVideo,toggleCommentLike,totalLikes,likeStatus}