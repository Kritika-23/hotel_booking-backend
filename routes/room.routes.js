import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isOwner } from "../middlewares/isOwner.js";
import { upload } from "../config/multer.js";
import {
  addRoom,
  getOwnerRooms,
  getAllRooms,
  deleteRoom,
  getSingleRoom,
  updateRoom,
  getRoomsByHotel,
} from "../controllers/room.controller.js";

import { safeMultipleUpload } from "../config/multer.js";

const roomRouter = express.Router();


// ADD ROOM
roomRouter.post(
  "/add",
  isAuthenticated,
  isOwner,
  safeMultipleUpload("images", 10),
  addRoom
);


// GET OWNER ROOMS
roomRouter.get(
  "/get",
  isAuthenticated,
  isOwner,
  getOwnerRooms
);


// GET ALL ROOMS
roomRouter.get(
  "/get-all",
  getAllRooms
);


// GET SINGLE ROOM
roomRouter.get(
  "/single/:id",
  getSingleRoom
);


// UPDATE ROOM
// roomRouter.put(
//   "/update/:id",
//   isAuthenticated,
//   isOwner,
//   updateRoom
// );

roomRouter.put(
  "/update/:id",
  isAuthenticated,
  isOwner,
  upload.array("images"),
  updateRoom
);
// DELETE ROOM
roomRouter.delete(
  "/delete/:roomId",
  isAuthenticated,
  isOwner,
  deleteRoom
);


// GET ROOMS BY HOTEL
roomRouter.get(
  "/by-hotel/:hotelId",
  getRoomsByHotel
);


export default roomRouter;
