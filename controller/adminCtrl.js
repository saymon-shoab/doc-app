// import doctorModel from "../models/doctorModel";
// import userModel from "../models/userModels";
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data",
      data: users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error while fetching users",
      data: error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "doctors data",
      data: doctors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error while fetching users",
      error,
    });
  }
};

const changeAccountStatusController = async (req, res, next) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notification = user.notifcation;
    notification.push({
      type: "doctor-account-request-update",
      message: `your doctor account request has ${status}`,
      onClickPath: "/notification",
    }),
      (user.isDoctor = status === "approve" ? true : false);
    await user.save();
    res.status(201).send({
      success: true,
      message: "account status Updated",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in account status",
      error,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
};
