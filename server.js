const express = require("express");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const userRoute = require("./Routes/userRoutes");
const adminRoute = require("./Routes/adminRoutes");
const doctorRoute = require("./Routes/doctorRoutes");
const path = require('path')
mongoose.set("strictQuery", true);
// dot env config
dotenv.config();
// mongodb connection
connectDB();
// rest object
const app = express();

// middleware..
app.use(express.json());
app.use(moragan("dev"));

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/doctor", doctorRoute);
app.get("/", (req, res) => {
  res.send(`<h1>App is running</h1>`);
});


// static file
app.use(express.static(path.join(__dirname,"./client/build")))
app.get('*',function(req,res) {
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})
const port = process.env.PORT || 8080;

// listen port
app.listen(port, () => {
  console.log(
    `server running in  ${process.env.NODE_MODE} on port ${process.env.PORT} `.bgCyan.white
  );
});
