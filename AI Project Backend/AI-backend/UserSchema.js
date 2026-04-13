const mongoose = require("mongoose");

const SignInSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    subject: { type: String },
    status: { type: String, default: "Active" }
}, { 
    timestamps: true,
    collection: "users" 
});

const SignInUser = mongoose.model("User", SignInSchema);
module.exports = SignInUser;