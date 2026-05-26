// import express from "express";
// import multer from "multer";
// import {
//   isAuth,
//   getUserProfile,
//   uploadProfile,
//   deleteProfileImage,
// } from "../controllers/user.controller.js";
// import { isAuthenticated } from "../middlewares/isAuthenticated.js";

// const router = express.Router();

// // ✅ multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // ✅ user.routes.js

// router.get("/is-auth", isAuthenticated, isAuth);
// router.get("/me", isAuthenticated, getUserProfile);
// router.post("/upload-profile", isAuthenticated, upload.single("image"), uploadProfile);
// router.post("/delete-profile-image", isAuthenticated, deleteProfileImage);



// export default router;
import express from "express";
import multer from "multer";
import {
  isAuth,
  getUserProfile,
  uploadProfile,
  deleteProfileImage,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ================= ROUTES =================

// ✅ Check auth
router.get("/is-auth", isAuthenticated, isAuth);

// ✅ Get current user profile
router.get("/me", isAuthenticated, getUserProfile);

// ✅ Upload profile image
router.post(
  "/upload-profile",
  isAuthenticated,
  upload.single("image"),
  uploadProfile
);

// ✅ Delete profile image
router.delete(
  "/delete-profile-image",
  isAuthenticated,
  deleteProfileImage
);

export default router;