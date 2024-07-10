const userModel = require("../models/userModels");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");

// email config
const transportar = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "djshoab@gmail.com",
    pass: "123456789",
  },
});

// secret key
const secretKey = process.env.JWT_SECRET;

const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({
        message: "user Already Exist",
        success: false,
      });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const data = await new userModel(req.body).save();

    res.status(201).send({
      success: true,
      message: "Register Successfully",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Register controller ${error.message}`,
    });
  }
};
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({
      success: true,
      message: "Login Success",
      token,
    });
  } catch (error) {
    // res.status(500).send({message: `Error in login CTRL &{error.message}`});
    res.status(500).send({
      success: false,
      message: `error in login  controller ${error.message}`,
    });
  }
};

// send link to email for reset password
const PassResetController = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }
  try {
    const user = await userModel.findOne({ email: email });
    const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: "120s" });

    const setusertoken = await user.findByIdAndUpdate(
      { _id: user._id },
      {
        verifytoken: token,
      }
    );
  } catch (error) {}
};

// auth controller
const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};

const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    // seennotification.push(...notifcation);
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as user",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      message: "error in notification",
      success: false,
      error,
    });
  }
};
// delete notification controller...
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notification Deleted Successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "unable to delete all notification...",
    });
  }
};
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approve" });
    res.status(200).send({
      success: true,
      message: "Fetch doctors list successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error while Fetching Doctor...",
    });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH-mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _Id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error while booking appointment",
      error,
    });
  }
};

const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const formTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel({
      doctorId,
      date,
      time: {
        $get: formTime,
        $let: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointment not available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        message: "Appointment  available",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "error in Booking",
    });
  }
};
const getUserAppointmentController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      message: "Users Appointments Fetched successfully",
      data: appointments,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "upps something wrong user appointment is not retrived",
    });
  }
};
module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  PassResetController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  getUserAppointmentController,
};
