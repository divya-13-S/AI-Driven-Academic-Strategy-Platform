const mongoose = require("mongoose");
const Subject = require("./Subject");
const Topic = require("./Topics");
const Material = require("./Materials");

async function checkUnits() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const subjectName = "Physics";

        const subjects = await Subject.find({ name: subjectName });
        const subUnits = [...new Set(subjects.map(s => s.title))];
        
        const topics = await Topic.find({ subject: subjectName });
        const topicUnits = topics.map(t => t.topicName);

        const materials = await Material.find({ subject: subjectName });
        const materialUnits = [...new Set(materials.map(m => m.topic))];

        console.log("SUBJECT_UNITS:" + JSON.stringify(subUnits));
        console.log("TOPIC_UNITS:" + JSON.stringify(topicUnits));
        console.log("MATERIAL_UNITS:" + JSON.stringify(materialUnits));

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUnits();
