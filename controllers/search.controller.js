import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

export const globalSearch = async (req, res) => {
  try {

    const query = req.query.query;

    if (!query) {
      return res.json({
        success: true,
        hotels: [],
        rooms: [],
        bookings: [],
        users: [],
      });
    }

    const hotels = await Hotel.find({
      hotelName: { $regex: query, $options: "i" },
    });

    const rooms = await Room.find({
      roomType: { $regex: query, $options: "i" },
    });

    const users = await User.find({
      name: { $regex: query, $options: "i" },
    });

    const bookings = await Booking.find()
      .populate("hotel")
      .populate("user");

    res.json({
      success: true,
      hotels,
      rooms,
      users,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};