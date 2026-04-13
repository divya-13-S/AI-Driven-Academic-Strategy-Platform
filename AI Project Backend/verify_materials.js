const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function verify() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        // Use a known subject from previous logs if possible, or just check all
        const subjects = await Material.distinct("subject");
        console.log("Subjects with materials:", subjects);

        if (subjects.length > 0) {
            const subject = subjects[0];
            const materials = await Material.find({ 
                subject: { $regex: new RegExp("^" + subject + "$", "i") } 
            }).sort({ topic: 1 });
            console.log(`Materials for ${subject}:`, materials.length);
            if (materials.length > 0) {
                console.log("First material sample:", {
                    topic: materials[0].topic,
                    contentPreview: materials[0].content.substring(0, 50)
                });
            }
        }

        console.log("Verification completed successfully!");
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
