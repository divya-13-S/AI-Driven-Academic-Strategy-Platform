const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function checkUnits() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    const subjects = await Material.distinct("subject");
    for (const subject of subjects) {
      const topics = await Material.distinct("topic", { subject });
      console.log(subject + ": " + topics.length + " units");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUnits();