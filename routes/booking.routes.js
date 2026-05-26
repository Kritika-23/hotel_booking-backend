import express from "express";

import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isOwner } from "../middlewares/isOwner.js";

import {
  bookRoom,
  checkRoomAvailability,
  getUserBookings,
  getHotelBookings,
  confirmBooking,
  markAsPaid,
  cancelBooking,
} from "../controllers/booking.controller.js";

const bookingRouter = express.Router();

// CHECK AVAILABILITY
bookingRouter.post(
  "/check-availability",
  checkRoomAvailability
);

// BOOK ROOM
bookingRouter.post(
  "/book",
  isAuthenticated,
  bookRoom
);

// USER BOOKINGS
bookingRouter.get(
  "/user",
  isAuthenticated,
  getUserBookings
);

// HOTEL OWNER BOOKINGS
bookingRouter.get(
  "/hotel",
  isAuthenticated,
  isOwner,
  getHotelBookings
);

// CONFIRM BOOKING
bookingRouter.put(
  "/confirm/:id",
  isAuthenticated,
  isOwner,
  confirmBooking
);

// CANCEL BOOKING
bookingRouter.put(
  "/cancel/:id",
  isAuthenticated,
  isOwner,
  cancelBooking
);

// MARK AS PAID
bookingRouter.put(
  "/paid/:id",
  isAuthenticated,
  isOwner,
  markAsPaid
);

export default bookingRouter;