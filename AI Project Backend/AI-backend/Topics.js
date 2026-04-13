const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    topicName: { type: String, required: true },
    createdBy: { type: String }, // Faculty email or ID
}, { 
    timestamps: true,
    collection: "topics"
});

module.exports = mongoose.model("Topic", topicSchema);

