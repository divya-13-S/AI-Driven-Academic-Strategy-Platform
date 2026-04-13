const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");
const Subject = require("./AI-backend/Subject");
const Topic = require("./AI-backend/Topics");

async function populateChemistry() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        // 1. Find all units for Chemistry
        const units = new Set();
        const subjects = await Subject.find({ name: /chemistry/i });
        subjects.forEach(s => units.add(s.title.trim()));
        
        const topics = await Topic.find({ subject: /chemistry/i });
        topics.forEach(t => units.add(t.topicName.trim()));

        console.log("Units found for Chemistry:", Array.from(units));

        for (const unit of units) {
            const existing = await Material.findOne({ 
                subject: "Chemistry", 
                topic: unit 
            });

            if (!existing) {
                const newMaterial = new Material({
                    subject: "Chemistry",
                    topic: unit,
                    content: `This is the comprehensive study material for ${unit}. It covers all the core concepts, theories, and practical applications in Chemistry.`,
                    videoLink: "https://www.youtube.com/results?search_query=chemistry+" + unit.replace(/\s+/g, "+"),
                    pdfLink: "https://www.google.com/search?q=chemistry+" + unit.replace(/\s+/g, "+") + "+pdf"
                });
                await newMaterial.save();
                console.log(`Created material for: ${unit}`);
            } else {
                console.log(`Material already exists for: ${unit}`);
            }
        }

        console.log("\nPopulating completed!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
populateChemistry();
