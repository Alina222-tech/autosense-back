const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"], // only allow "user" or "admin"
    default: "user",
    required: true
  },
  savedSearches: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Users", userSchema);
