import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {

  try {

    const { userId } = getAuth(req);

    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    }

    // ✅ FIXED
   const clerkUser = await clerkClient.users.getUser(userId);
    let user = await User.findOne({
      clerkId: userId,
    });

    // ✅ create user if not exists
    if (!user) {

      user = await User.create({

        clerkId: userId,

        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,

        email:
          clerkUser.emailAddresses[0]?.emailAddress,

        profileImage:
          clerkUser.imageUrl,

      });

    }

    req.user = user;

    next();

  } catch (error) {

    console.error("Auth Error:", error);

    return res.status(401).json({

      success: false,

      message: "Authentication failed",

    });

  }

};