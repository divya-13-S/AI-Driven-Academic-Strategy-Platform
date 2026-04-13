const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function checkChemistry() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const materials = await Material.find({ 
            subject: { $regex: /chemistry/i } 
        });
        
        console.log(`\nFound ${materials.length} materials for Chemistry (case-insensitive)`);
        materials.forEach(m => {
            console.log(`- ID: ${m._id}, Subject: "${m.subject}", Topic: "${m.topic}", Content Length: ${m.content ? m.content.length : 0}`);
        });

        const allSubjects = await Material.distinct("subject");
        console.log("\nAll unique subjects in Materials collection:", allSubjects);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkChemistry();
