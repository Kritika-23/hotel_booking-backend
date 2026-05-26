import Room from "../models/room.model.js";

// ➕ Add Room
export const addRoom = async (req, res) => {
  try {
    const {
      roomType,
      hotel,
      pricePerNight,
      description,
      amenities,
      isAvailable,
    } = req.body;

  const parsedAmenities = JSON.parse(req.body.amenities);
    //const images = req.files?.map((file) => `/uploads/rooms/${file.filename}`) || [];
//const images = req.files?.map(file => `/uploads/${file.filename}`) || [];
//const images = req.files?.map(file => `/images/${file.filename}`) || [];
//const images = req.files?.map(file => `/images/${file.filename}`) || [];
// const images = req.files?.map(file => `/images/${file.filename}`) || [];
const images = req.files?.map(file => `/uploads/${file.filename}`);

    const newRoom = await Room.create({
      roomType,
      hotel,
      pricePerNight,
      description,
      amenities: parsedAmenities,
      isAvailable,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Room added successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Error in addRoom:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🏨 Owner’s Rooms
export const getOwnerRooms = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const ownerId = req.user._id;

    const rooms = await Room.find()
      .populate({
        path: "hotel",
        select: "hotelName hotelAddress rating owner",
      })
      .exec();
console.log("ROOMS FROM DB:", rooms);
    const ownerRooms = rooms.filter(
      (room) => room.hotel && room.hotel.owner?.toString() === ownerId.toString()
    );

    return res.status(200).json({ success: true, rooms: ownerRooms });
  } catch (error) {
    console.error("Error in getOwnerRooms:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🛏️ Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate({
        path: "hotel",
        select: "hotelName hotelAddress amenities rating owner",
        populate: { path: "owner", select: "name email" },
      })
      .exec();

    res.json({ success: true, rooms });
  } catch (error) {
    console.error("Error in getAllRooms:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔍 Get Single Room
export const getSingleRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate({
        path: "hotel",
        select: "hotelName hotelAddress amenities rating owner",
        populate: { path: "owner", select: "name email" },
      })
      .select("-__v")
      .exec();

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      room,
      message: "Room details fetched successfully",
    });
  } catch (error) {
    console.error("Error in getSingleRoom:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching room details",
      error: error.message,
    });
  }
};
export const updateRoom = async (req, res) => {
  try {
    const {
      roomType,
      pricePerNight,
      description,
      amenities,
      isAvailable,
    } = req.body;

    const images =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    // ✅ FIX HERE
    let parsedAmenities = amenities;

    if (typeof amenities === "string") {
      parsedAmenities = JSON.parse(amenities);
    }

    const updateData = {
      roomType,
      pricePerNight,
      description,
      amenities: parsedAmenities,
      isAvailable,
    };

    if (images.length > 0) {
      updateData.images = images;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("hotel");

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// 🗑️ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const deleted = await Room.findByIdAndDelete(roomId);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Room not found" });

    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRoom:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// // 🏨 Get Rooms By Hotel
// export const getRoomsByHotel = async (req, res) => {
//   try {
//     const { hotelId } = req.params;

//     const rooms = await Room.find({ hotel: hotelId });

//     res.status(200).json({
//       success: true,
//       rooms,
//     });

//   } catch (error) {
//     console.error("Error in getRoomsByHotel:", error);

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export const getRoomsByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({
      hotel: req.params.hotelId,
    });

    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};