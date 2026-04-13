const mongoose = require("mongoose");
const Topic = require("./AI-backend/Topics");
const Material = require("./AI-backend/Materials");
const Subject = require("./AI-backend/Subject");

async function check() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const subjects = await Topic.distinct("subject");
        for (const s of subjects) {
            console.log(`\nSubject: ${s}`);
            const topics = await Topic.find({ subject: s });
            console.log("Topics in DB order:", topics.map(t => t.topicName));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
