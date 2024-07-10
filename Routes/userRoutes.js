const express = require("express");
const {
  loginController,
  registerController,
  PassResetController,
  applyDoctorController,
  authController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  getUserAppointmentController,
} = require("../controller/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
// router onject
const router = express.Router();
// login || post
router.post("/login", loginController);
// register || post
router.post("/register", registerController);
// forgot password || post
router.post("/getUserData", authMiddleware, authController);
//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);
//notification Doctor || Post
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Delete notification Doctor || Delete
router.post(
  "/delet-all-notification",
  authMiddleware,
  deleteAllNotificationController
);
router.post("/book-appointment", authMiddleware, bookAppointmentController);
router.post(
  "/booking-availability",
  authMiddleware,
  bookingAvailabilityController
);

router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);
router.get("/getUserAppointment", authMiddleware, getUserAppointmentController);

router.post("/sendpasswordlink", PassResetController);
module.exports = router;
