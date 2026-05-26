import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import Hotel from "../models/hotel.model.js";
import User from "../models/user.model.js";
import transporter from "../config/nodemailer.js";



// =============================
// CHECK ROOM AVAILABILITY LOGIC
// =============================
export const checkAvailability = async ({
  room,
  checkInDate,
  checkOutDate,
}) => {
  try {
    const booking = await Booking.find({
      room,
      checkIn: { $lt: new Date(checkOutDate) },
      checkOut: { $gt: new Date(checkInDate) },
    });

    return booking.length === 0;
  } catch (error) {
    console.log("Availability Error:", error);
    return false;
  }
};


// =============================
// API: CHECK ROOM AVAILABILITY
// =============================
export const checkRoomAvailability = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    res.json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================
// Generate Booking ID
// =============================

const generateBookingId = () => {
  return (
    "GS-" +
    new Date().getFullYear() +
    "-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
};

// =============================
// API: BOOK ROOM
// =============================
export const bookRoom = async (req, res) => {
  try {
    const user = req.user;

    let { room, checkInDate, checkOutDate, persons, paymentMethod } = req.body;

    persons = Number(persons);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today) {
      return res.status(400).json({ success: false, message: "Check-in date cannot be in past" });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in" });
    }

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Room not available" });
    }

    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (persons > roomData.maxGuests) {
      return res.status(400).json({ success: false, message: "Exceeds capacity" });
    }

    const nights = Math.ceil(
      (checkOut - checkIn) / (1000 * 3600 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    const booking = await Booking.create({
      user: user._id,   // ✅ FIXED
      room,
      hotel: roomData.hotel._id,
      checkIn,
      checkOut,
      persons,
      bookingId: generateBookingId(),
      totalPrice,
      paymentMethod,
      status: "pending",
      isPaid: false,
    });

    res.json({
      success: true,
      message: "Room booked successfully",
      bookingId: booking._id,
    });
   console.log("BOOKING CREATED:", booking);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================
// GET USER BOOKINGS
// =============================
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ FIXED

  const bookings = await Booking.find({ user: userId })
  .populate("room")
  .populate("hotel")
  .populate("user", "username email image")
  .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// =============================
// GET HOTEL OWNER BOOKINGS
// =============================
export const getHotelBookings = async (req, res) => {
  try {
    const ownerId = req.user._id; // ✅ FIXED

    const hotels = await Hotel.find({ owner: ownerId }).select("_id");

    const hotelIds = hotels.map((h) => h._id);

   const bookings = await Booking.find({
  hotel: { $in: hotelIds },
})
  .populate("room")
  .populate("hotel")
  .populate("user", "username email image")
  .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const cancelBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// ADMIN CONFIRM BOOKING
// =============================
export const confirmBooking = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "confirmed";

    await booking.save();

    res.json({
      success: true,
      message: "Booking confirmed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// ADMIN MARK AS PAID
// =============================
export const markAsPaid = async (req, res) => {
  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.isPaid = true;

    await booking.save();

    res.json({
      success: true,
      message: "Payment updated",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};