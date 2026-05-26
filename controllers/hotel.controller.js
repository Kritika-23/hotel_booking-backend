import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";
// Register Hotel
export const registerHotel = async (req, res) => {
  try {
    const { hotelName, hotelAddress, city, rating, amenities } = req.body;
const parsedAmenities = JSON.parse(amenities);
    if (!hotelName || !hotelAddress || !city || !rating || !amenities) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }


    // const images = req.files.map(file => file.filename);
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const newHotel = new Hotel({
      hotelName,
      hotelAddress,
      city,
      rating: Number(rating),
      amenities: parsedAmenities,
      images,
      owner: req.user._id,
    });

    await newHotel.save();

    return res.status(201).json({
      success: true,
      message: "Hotel Registered Successfully",
    });

  } catch (error) {
    console.error("Register Hotel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get All Hotels
export const getAllHotels = async (req, res) => {
  try {
 const hotels = await Hotel.find().populate("owner", "name email");

const hotelsWithPrice = await Promise.all(
  hotels.map(async (hotel) => {

    const rooms = await Room.find({
      hotel: hotel._id,
    });

    const startingPrice =
      rooms.length > 0
        ? Math.min(
            ...rooms.map(room => room.pricePerNight)
          )
        : 0;

    return {
      ...hotel._doc,
      startingPrice,
    };
  })
);

return res.status(200).json({
  hotels: hotelsWithPrice,
  success: true,
});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
// UPDATE HOTEL
export const updateHotel = async (req, res) => {

  try {

    console.log(req.files);

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    hotel.hotelName = req.body.hotelName;
    hotel.hotelAddress = req.body.hotelAddress;
    hotel.city = req.body.city;
    hotel.rating = req.body.rating;
    hotel.amenities = req.body.amenities;

if (req.files?.length > 0) {

  const index = req.body.imageIndex;

  const newImage = `/uploads/${req.files[0].filename}`;

  if (index !== undefined) {
    hotel.images[index] = newImage; // 🔥 replace only one
  } else {
    hotel.images.push(newImage); // fallback add
  }
}
    await hotel.save();

    res.json({
      success: true,
      hotel,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};
// DELETE SINGLE HOTEL IMAGE
export const deleteHotelImage = async (req, res) => {
  try {
    const { hotelId, image } = req.body;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // remove image from array
    hotel.images = hotel.images.filter(
      (img) => img !== image
    );

    await hotel.save();

    res.json({
      success: true,
      message: "Image deleted",
      hotel,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
// Delete Hotel
export const deleteHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const deletedHotel = await Hotel.findByIdAndDelete(hotelId);
    if (!deletedHotel) {
      return res.status(404).json({ message: "Hotel not found", success: false });
    }
    return res.status(200).json({ message: "Hotel deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Search Hotels
export const searchHotels = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, rating } = req.query;

    let filter = {};

    if (destination) {
      filter.city = { $regex: new RegExp(destination, "i") };
    }

   

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    const hotels = await Hotel.find(filter).populate("owner", "name email");
    return res.status(200).json({ hotels, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get Hotel By ID
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("owner", "name email");

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    const rooms = await Room.find({
      hotel: hotel._id,
    });

    const startingPrice =
      rooms.length > 0
        ? Math.min(...rooms.map(room => room.pricePerNight))
        : 0;

    res.status(200).json({
      success: true,
      hotel: {
        ...hotel._doc,
        startingPrice,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
// Get Owner Hotels

export const getOwnerHotels = async (req, res) => {
  try {

    const hotels = await Hotel.find({
      owner: req.user._id,
    }).populate("owner", "name email");

    const hotelsWithPrice = await Promise.all(

      hotels.map(async (hotel) => {

        const rooms = await Room.find({
          hotel: hotel._id,
        });

        const startingPrice =
          rooms.length > 0
            ? Math.min(
                ...rooms.map(room => room.pricePerNight)
              )
            : 0;

        return {
          ...hotel._doc,
          startingPrice,
        };
      })
    );

    res.status(200).json({
      hotels: hotelsWithPrice,
      success: true,
    });

  } catch (error) {

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });

  }
};

