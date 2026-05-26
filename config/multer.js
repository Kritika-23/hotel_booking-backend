import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ File filter (FIXED - PROFESSIONAL VERSION)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/pjpeg",
    "image/jfif",
  ];

  const allowedExt = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  // 🔍 DEBUG (keep for now)
  console.log("MIME TYPE:", file.mimetype);
  console.log("FILE NAME:", file.originalname);
  console.log("EXT:", ext);

  if (
    allowedTypes.includes(file.mimetype) ||
    allowedExt.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image format"), false);
  }
};

// ✅ Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ✅ Safe wrapper (prevents crash)
export const safeMultipleUpload = (
  fieldName = "images",
  maxCount = 5
) => {
  return (req, res, next) => {
       console.log("🔥 MULTER MIDDLEWARE HIT");
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.log("UPLOAD ERROR:", err.message);

        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

export { upload };
