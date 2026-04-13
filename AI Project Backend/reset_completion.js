const mongoose = require("mongoose");
const Completion = require("./AI-backend/Completion");

async function resetCompletion() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        // Delete all completion records to reset progress to 0%
        const result = await Completion.deleteMany({});
        console.log(`Deleted ${result.deletedCount} completion records`);

        console.log("Completion data reset completed!");
    } catch (err) {
        console.error("Error resetting completion data:", err);
    } finally {
        await mongoose.disconnect();
    }
}

resetCompletion();