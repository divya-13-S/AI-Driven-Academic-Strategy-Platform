const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    content: { type: String, required: true },
    videoLink: { type: String, default: "" },
    pdfLink: { type: String, default: "" }
}, { 
    timestamps: true,
    collection: "materials"
});

const Materials = mongoose.model("Material", materialSchema);
module.exports = Materials;