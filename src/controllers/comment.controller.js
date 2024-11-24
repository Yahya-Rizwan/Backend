import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
const addComment = asyncHandler(async(req,res)=>{
        const {content} = req.body
        const {videoId} = req.params
        const user = req.user
        console.log(req.user)
        console.log(new mongoose.Types.ObjectId(videoId))
        if(!user){
            throw new ApiError(400,"user not found")
        }
        const comment = await Comment.create({
           content : content,
           video : new mongoose.Types.ObjectId(videoId),
           owner :user._id
})
      return res.status(200).json(new ApiResponse(200,comment,"comment added"))
})
const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const comments = await Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])
    console.log(comments)
    return res.status(200).json(new ApiResponse(200,comments,"all comments on this video"))
})
const deleteComment = asyncHandler(async(req,res)=>{
   
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment not found")
    }

    const video = await Video.findById(comment.video)
    const userId = req.user._id
    
    
    console.log(comment.owner.toString())
    console.log( video.owner.toString())
    if (comment.owner.toString()!== video.owner.toString()) {
        throw new ApiError(400, "Unauthorised to delete comment");
      }
    const deleteAComment =await  Comment.findByIdAndDelete(commentId)
  

    return res.status(200).json(new ApiResponse(200,{},"comment deleted"))
})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    const {content} = req.body
    const video = await Video.findById(comment.video)
    if (comment.owner.toString()!== video.owner.toString()) {
        throw new ApiError(400, "Unauthorised to delete comment");
      }

    comment.content = content|| comment.content
    await comment.save();
    const newcomment = await Comment.findById(commentId)
    return res.status(200).json(new ApiResponse(200,newcomment,"comment updated"))
    
})
export {addComment,getVideoComments,deleteComment,updateComment}