import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/user.model.js";

const validRoles = ["user", "owner", "admin"];
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const fallbackAdminEmails = ["kritika276591@gmail.com"];

const getClerkRole = (clerkUser, email) => {
  const metadataRole =
    clerkUser.publicMetadata?.role ||
    clerkUser.privateMetadata?.role ||
    clerkUser.unsafeMetadata?.role;

  if (validRoles.includes(metadataRole)) {
    return metadataRole;
  }

  if (
    email &&
    [...adminEmails, ...fallbackAdminEmails].includes(email.toLowerCase())
  ) {
    return "admin";
  }

  return "user";
};

export const isAuthenticated = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const role = getClerkRole(clerkUser, email);

    let user = await User.findOne({
      clerkId: userId,
    });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          email?.split("@")[0] ||
          "User",
        email,
        role,
        profileImage: clerkUser.imageUrl,
      });
    } else {
      let shouldSave = false;

      if (user.role !== role) {
        user.role = role;
        shouldSave = true;
      }

      if (email && user.email !== email) {
        user.email = email;
        shouldSave = true;
      }

      if (clerkUser.imageUrl && user.profileImage !== clerkUser.imageUrl) {
        user.profileImage = clerkUser.imageUrl;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
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
