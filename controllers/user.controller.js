// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import gravatar from "gravatar";
// import fs from "fs";
// import path from "path";

// // ✅ SIGNUP CONTROLLER
// export const signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Use gravatar fallback image for new user
//     const profileImage = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "user",
//       profileImage,
//     });

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: newUser,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ✅ LOGIN CONTROLLER
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.json({ message: "All fields are required", success: false });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.json({ message: "User not found", success: false });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.json({ message: "Invalid password", success: false });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "Lax",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     return res.json({
//       message: "Login successful",
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };

// // ✅ LOGOUT CONTROLLER
// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token");
//     return res.json({ message: "Logout successful", success: true });
//   } catch (error) {
//     console.error("Logout Error:", error);
//     return res.json({ message: "Internal server error", success: false });
//   }
// };

// // ✅ IS AUTH CONTROLLER
// export const isAuth = async (req, res) => {
//   try {
//     if (!req.user)
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });

//     const { id } = req.user;
//     const user = await User.findById(id).select("-password");

//     if (!user)
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });

//     return res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error("isAuth Error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };

// // ✅ GET LOGGED-IN USER PROFILE
// export const getUserProfile = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Not authenticated" });
//     }

//     const user = await User.findById(req.user._id).select("-password");

//     // ✅ Gravatar fallback if no uploaded image
//     const profileImage =
//       user.profileImage ||
//       gravatar.url(user.email, { s: "200", r: "pg", d: "mm" });

//     return res.status(200).json({
//       success: true,
//       user: { ...user._doc, profileImage },
//     });
//   } catch (error) {
//     console.error("getUserProfile Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// // ✅ UPLOAD PROFILE IMAGE
// export const uploadProfile = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized user",
//       });
//     }

//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No file uploaded" });
//     }

//     // Store public path
//     const imageUrl = `/images/${req.file.filename}`;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profileImage: imageUrl },
//       { new: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Profile image updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Upload Profile Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// // ✅ DELETE PROFILE IMAGE (backend version)
// export const deleteProfileImage = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized user" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (!user.profileImage) {
//       return res.status(400).json({ success: false, message: "No profile image to delete" });
//     }

//     // Construct image path and remove file if exists
//     const imagePath = path.join("uploads", path.basename(user.profileImage));
//     if (fs.existsSync(imagePath)) {
//       fs.unlinkSync(imagePath);
//     }

//     // Remove reference from DB
//     user.profileImage = null;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Profile image deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete Profile Image Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting profile image",
//     });
//   }
// // };import User from "../models/user.model.js";
import gravatar from "gravatar";
import fs from "fs";
import path from "path";
import User from "../models/user.model.js";

// ✅ CHECK AUTH
export const isAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("isAuth Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ GET LOGGED-IN USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const profileImage =
      user.profileImage ||
      gravatar.url(user.email, { s: "200", d: "mm" });

    return res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        profileImage,
      },
    });
  } catch (error) {
    console.error("getUserProfile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ UPLOAD PROFILE IMAGE
export const uploadProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,   // ✅ ONLY THIS
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log("🔥 Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE PROFILE IMAGE
export const deleteProfileImage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!user.profileImage) {
      return res.status(400).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    const imagePath = path.join(
      "uploads",
      path.basename(user.profileImage)
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    user.profileImage = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Delete Profile Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting profile image",
    });
  }
};
