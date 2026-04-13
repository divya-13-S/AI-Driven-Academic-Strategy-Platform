const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function checkMaterials() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB");

    const materials = await Material.find({});
    console.log(`Found ${materials.length} materials:`);

    materials.forEach((mat, index) => {
      console.log(`${index + 1}. Subject: ${mat.subject}, Topic: ${mat.topic}`);
      console.log(`   Video: ${mat.videoLink || 'No video link'}`);
      console.log(`   PDF: ${mat.pdfLink || 'No PDF link'}`);
      console.log(`   Content: ${mat.content ? mat.content.substring(0, 50) + '...' : 'No content'}`);
      console.log('---');
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkMaterials();