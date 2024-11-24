import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { likeStatus, toggleCommentLike, toggleLikeVideo, totalLikes } from "../controllers/like.controller.js";

const router = Router();
router.route("/likeVideo/:videoId").post(verifyJWT,toggleLikeVideo)
router.route("/likeComment/:commentId").post(verifyJWT,toggleCommentLike)
router.route("/totalLikes/:videoId").get(totalLikes)
router.route("/likeStatus/:videoId").get(verifyJWT,likeStatus)
export default router;
