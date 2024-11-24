import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { totalLikes } from "./like.controller.js";
import {User} from "../models/user.model.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
     const channel = new mongoose.Types.ObjectId(req.params.channel)
     const subscriber = req.user._id

     if(!subscriber){
        throw new ApiError(400,"user not found")
     }
     if(!channel){
        throw new ApiError(400,"channel not found")
     }
     
     const isSubscribed = await Subscription.find({
         $and:[
            {subscriber},{channel}
         ]
     })
     if(isSubscribed[0]){
        const removeSubscription = await Subscription.findByIdAndDelete(
            isSubscribed[0]._id,
            {new:true}
        )
        return res.status(200).json(new ApiResponse(200,removeSubscription,"unsubscribed"))
     }

     const addsub = await Subscription.create({
        subscriber:subscriber,
        channel:channel
     })
     return res.status(200).json(new ApiResponse(200,addsub,"subscribed to the channel"))
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const channelList = await Subscription.aggregate([
        {
            $match:{
                subscriber:userId
            }
        },{
            $sort:{createdAt:-1}
        }
    ])
    return res.status(200).json(new ApiResponse(200,channelList,"all channels subscribed by the user"))
})
const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    const channel = await User.findById(channelId).select("-refershToken -password")
    
    if(!channel){
        throw new ApiError(400,"channel does not exist")
    }
    const totalSubs = await Subscription.aggregate([
        {
            $match:{
                channel:channel._id
            }
        },{
            $count:"Subscribers"
        }
    ])
    console.log(totalSubs)
    return res.status(200).json(new ApiResponse(200,totalSubs,"total subscribers"))
})
const isSubscribed = asyncHandler(async(req,res)=>{
    const channel = new mongoose.Types.ObjectId(req.params.channelId)
    if(!channel){
        throw new ApiError(400,"channel not found")
    }
    const subscriber = req.user._id
    const isSubscribed = await Subscription.find({
    $and: [
            {subscriber:subscriber},
            {channel:channel}
        ]
    })
    if(isSubscribed[0]){
        return res.status(200).json(new ApiResponse(200,true,"channel is subscribed"))
    }
    return res.status(200).json(new ApiResponse(200,false,"not subscribed"))
})
export {toggleSubscription,getSubscribedChannels,getChannelSubscribers,isSubscribed}