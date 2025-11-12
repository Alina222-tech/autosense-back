const Car = require("../models/car.model.js");

// Add new car
const addcar = async (req, res) => {
  try {
    const { name, brand, price, type, year, fuelType, mileage, imageURL, location, description } = req.body;

    if (!name || !brand || !price) {
      return res.status(400).json({ message: "Name, brand, and price are required." });
    }

    const car = await Car.create({
      name,
      brand,
      price,
      type,
      year,
      fuelType,
      mileage,
      imageURL,
      location,
      description,
    });

    return res.status(200).json({ message: "Car added successfully.", car });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get all cars
const allcars = async (req, res) => {
  try {
    const cars = await Car.find();
    if (!cars.length) return res.status(404).json({ message: "No car data found." });
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one car
const onecar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found." });
    res.status(200).json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete car
const deletecar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Car deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getDealers = async (req, res) => {
  try {
    console.log("📡 Fetching dealers...");

    const cars = await Car.find();
    console.log("✅ Cars found:", cars.length);

    const dealers = cars.map(car => ({
      name: car.name || "Unknown",
      address: car.location || "No location",
      brand: car.brand || "N/A"
    }));

    console.log("✅ Dealers prepared:", dealers.length);
    res.status(200).json(dealers);
  } catch (err) {
    console.error("❌ Error fetching dealers:", err.message);
    res.status(500).json({ message: err.message });
  }
};


module.exports = { addcar, allcars, onecar, deletecar, getDealers };
