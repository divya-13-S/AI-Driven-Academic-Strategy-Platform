const mongoose = require("mongoose");
const SignInUser = require("./AI-backend/UserSchema");
const Subject = require("./AI-backend/Subject");

async function verify() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        // 1. Check students/all logic
        const students = await SignInUser.find({ role: { $regex: /^student$/i } }, "name _id");
        console.log(`Found ${students.length} students.`);
        if (students.length === 0) {
            console.log("No students found in DB. Please ensure some users have role='student'.");
        } else {
            console.log("Sample student:", students[0].name);
        }

        // 2. Test bulk marks saving logic
        if (students.length > 0) {
            const testSubject = "Physics";
            const testUnit = "Unit 1: Test";
            const studentId = students[0]._id;
            const testMarks = "95";

            console.log(`\nTesting marks save for student ${students[0].name} in ${testSubject} - ${testUnit}`);
            
            await Subject.findOneAndUpdate(
                { userId: studentId, name: testSubject, title: testUnit },
                { marks: testMarks },
                { upsert: true, new: true }
            );

            const verified = await Subject.findOne({ userId: studentId, name: testSubject, title: testUnit });
            console.log("Verification Result:", verified ? `Marks Saved: ${verified.marks}` : "Save Failed");
        }

        console.log("\nVerification completed successfully!");
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
