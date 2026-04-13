const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function deepInvestigate() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const chemistryMaterials = await Material.find({ 
            subject: { $regex: /chemistry/i } 
        });
        
        console.log(`\n--- Chemistry Materials (Count: ${chemistryMaterials.length}) ---`);
        chemistryMaterials.forEach(m => {
            console.log(JSON.stringify(m, null, 2));
        });

        // Also check if there are any materials with NO subject or weird subject
        const weirdMaterials = await Material.find({ 
            subject: { $nin: ["Physics", "Chemistry", "Biology", "Maths"] } 
        });
        console.log(`\n--- "Weird" Materials (Count: ${weirdMaterials.length}) ---`);
        weirdMaterials.forEach(m => {
            console.log(`ID: ${m._id}, Subject: "${m.subject}", Topic: "${m.topic}"`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
deepInvestigate();
