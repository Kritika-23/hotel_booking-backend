export const isOwner = (req, res, next) => {
  try {
    if (
      req.user &&
      (req.user.role === "owner" || req.user.role === "admin")
    ) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
};