import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedChannels, isSubscribed, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()
router.route("/toggleSubscription/:channel").post(verifyJWT,toggleSubscription)
router.route("/channelsSubscribed").get(verifyJWT,getSubscribedChannels)
router.route("/allSubscribers/:channelId").get(getChannelSubscribers)
router.route("/isSubscribed/:channelId").get(verifyJWT,isSubscribed)

export default router