import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isOwner } from "../middlewares/isOwner.js";

import { 
  deleteHotel, 
  getAllHotels, 
  getOwnerHotels, 
  registerHotel, 
  searchHotels,
  getHotelById,
  updateHotel,
  deleteHotelImage,
} from "../controllers/hotel.controller.js";



import { safeMultipleUpload } from "../config/multer.js";

const hotelRouter = express.Router();

// REGISTER HOTEL
hotelRouter.post(
  "/register",
  isAuthenticated,
  isOwner,
  safeMultipleUpload("images", 5),
  registerHotel
);

// UPDATE HOTEL
hotelRouter.put(
  "/update/:id",
  isAuthenticated,
  isOwner,
  safeMultipleUpload("images", 5),
  updateHotel
);

// GET OWNER HOTELS
hotelRouter.get(
  "/get",
  isAuthenticated,
  isOwner,
  getOwnerHotels
);

// GET ALL HOTELS
hotelRouter.get("/get-all", getAllHotels);

// SEARCH HOTELS
hotelRouter.get("/search", searchHotels);

// DELETE HOTEL
hotelRouter.delete(
  "/delete/:hotelId",
  isAuthenticated,
  isOwner,
  deleteHotel
);

//  DELETE SINGLE HOTEL IMG
hotelRouter.post(
  "/delete-image",
  isAuthenticated,
  isOwner,
  deleteHotelImage
);
// GET SINGLE HOTEL
hotelRouter.get("/:id", getHotelById);

export default hotelRouter;

