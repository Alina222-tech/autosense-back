require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const userroute = require("./routes/user.route.js");
const carroute = require("./routes/car.routes.js");
const airoutes = require("./routes/ai.routes.js");

app.use(cors());
app.use(express.json());

app.use("/user", userroute);
app.use("/car", carroute);
app.use("/ai", airoutes);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
          serverSelectionTimeoutMS: 20000
    });
    isConnected = true;
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

app.get("/",(req,res)=>{
  res.send("server is running.")
})

connectDB();

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
  }
  next();
});

module.exports = app;
