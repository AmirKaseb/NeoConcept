import express from "express";
import * as postsController from "../controllers/postsController";
import * as authController from "../controllers/authController";
import checkSubjectRoomExists from "../middlewares/checkSubjectRoomExists";
import verifySubjectRoomMember from "../middlewares/verifySubjectRoomMember";
import { Role } from "@prisma/client";

const router = express.Router({ mergeParams: true });

router.get("/", authController.protect, checkSubjectRoomExists, verifySubjectRoomMember, postsController.getPosts);

router.get(
  "/:id",
  authController.protect,
  checkSubjectRoomExists,
  verifySubjectRoomMember,
  postsController.getPostById,
);

router.post(
  "/create",
  authController.protect,
  authController.restrict(Role.INSTRUCTOR),
  checkSubjectRoomExists,
  verifySubjectRoomMember,
  postsController.createPost,
);

router.patch(
  "/:id/update",
  authController.protect,
  authController.restrict(Role.INSTRUCTOR),
  checkSubjectRoomExists,
  verifySubjectRoomMember,
  postsController.updatePost,
);

router.delete(
  "/:id/delete",
  authController.protect,
  authController.restrict(Role.INSTRUCTOR),
  checkSubjectRoomExists,
  verifySubjectRoomMember,
  postsController.deletePost,
);

export default router;
