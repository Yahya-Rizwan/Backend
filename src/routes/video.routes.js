import { Router } from "express";
import { deleteVideo, getAllVideos , getVideoById, incrementViews, publishVideo, updateVideo, videosOnHomePage } from "../controllers/video.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

router.route("/publishVideo").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1,
        },
        {
            name:"thumbnail",
            maxCount:1,
        }
    ]), 
    verifyJWT,publishVideo
)
router.route("/all-videos/:userId").get(getAllVideos)
router.route("/:videoId").get(getVideoById)
router.route("/update-video/:videoId").post(
    upload.fields([
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    verifyJWT,
    updateVideo)
router.route("/deleteVideo/:videoId").post(deleteVideo)
router.route("/HomePage").get(videosOnHomePage)
router.route("/addViews/:videoId").get(incrementViews)


export default router;