const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminname: { type: String, required: true },
    adminemail: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  {
    collection: "admin-data",
  }
);

const Admin = mongoose.model("AdminData", adminSchema);
module.exports = Admin;
