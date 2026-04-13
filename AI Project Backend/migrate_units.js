const mongoose = require("mongoose");
const Topic = require("./AI-backend/Topics");
const Material = require("./AI-backend/Materials");
const Subject = require("./AI-backend/Subject");

async function migrate() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        // Get all unique subjects
        const subjectsInTopics = await Topic.distinct("subject");
        const subjectsInMaterials = await Material.distinct("subject");
        const subjectsInSubject = await Subject.distinct("name");
        
        const allSubjects = Array.from(new Set([...subjectsInTopics, ...subjectsInMaterials, ...subjectsInSubject])).filter(s => s);

        for (const subjectName of allSubjects) {
            console.log(`\n--- Migrating subject: ${subjectName} ---`);
            
            // Replicate the logic to get unique titles for this subject
            const uniqueTitles = new Set();
            
            const topics = await Topic.find({ subject: { $regex: new RegExp("^" + subjectName + "$", "i") } });
            topics.forEach(t => { if (t.topicName) uniqueTitles.add(t.topicName.trim()); });
            
            const materials = await Material.find({ subject: { $regex: new RegExp("^" + subjectName + "$", "i") } });
            materials.forEach(m => { if (m.topic) uniqueTitles.add(m.topic.trim()); });
            
            const subjects = await Subject.find({ name: { $regex: new RegExp("^" + subjectName + "$", "i") } });
            subjects.forEach(s => { if (s.title) uniqueTitles.add(s.title.trim()); });

            const titlesArray = Array.from(uniqueTitles);
            
            // Sort them if possible or just use current order
            // If they are already "Unit X", we should skip them
            // If they are not, we assign a number
            
            let count = 0;
            const titleMapping = {};

            // First, identify titles that ALREADY have numbers
            titlesArray.forEach(title => {
                const match = title.match(/^Unit\s+(\d+)/i);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > count) count = num;
                    titleMapping[title] = title;
                }
            });

            // Second, assign numbers to those that DON'T have them
            for (const title of titlesArray) {
                if (!titleMapping[title]) {
                    count++;
                    const newTitle = `Unit ${count}: ${title}`;
                    titleMapping[title] = newTitle;
                    console.log(`Mapped: "${title}" -> "${newTitle}"`);
                }
            }

            // Third, update the collections
            for (const oldTitle in titleMapping) {
                const newTitle = titleMapping[oldTitle];
                if (oldTitle === newTitle) continue;

                // Update Topic
                await Topic.updateMany(
                    { subject: { $regex: new RegExp("^" + subjectName + "$", "i") }, topicName: oldTitle },
                    { $set: { topicName: newTitle } }
                );

                // Update Material
                await Material.updateMany(
                    { subject: { $regex: new RegExp("^" + subjectName + "$", "i") }, topic: oldTitle },
                    { $set: { topic: newTitle } }
                );

                // Update Subject (Student records)
                await Subject.updateMany(
                    { name: { $regex: new RegExp("^" + subjectName + "$", "i") }, title: oldTitle },
                    { $set: { title: newTitle } }
                );
            }
        }

        console.log("\nMigration completed successfully!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
