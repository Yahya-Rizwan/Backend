import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";


const router = Router();

router.route("/addComment/:videoId").post(upload.fields([]),verifyJWT,addComment)
router.route("/allComments/:videoId").get(getVideoComments)
router.route("/deleteComment/:commentId").post(verifyJWT,deleteComment)
router.route("/updateComment/:commentId").post( upload.fields([
    {
      name: "content",
      maxCount: 1,
    },
  ]),verifyJWT,updateComment)
export default router