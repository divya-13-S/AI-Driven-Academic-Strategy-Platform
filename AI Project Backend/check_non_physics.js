const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");

async function checkOtherSubjects() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const allMarks = await Subject.find({ marks: { $exists: true, $ne: "" } });
        const summary = {};
        
        allMarks.forEach(m => {
            summary[m.name] = (summary[m.name] || 0) + 1;
        });

        console.log("\n--- Marks Summary by Subject ---");
        console.log(summary);

        console.log("\nDetailed non-Physics records:");
        allMarks.forEach(m => {
            if (m.name !== "Physics" && m.name !== "Phy") {
                console.log(`Subject: "${m.name}", Unit: "${m.title}", Marks: "${m.marks}", User: ${m.userId}`);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkOtherSubjects();
