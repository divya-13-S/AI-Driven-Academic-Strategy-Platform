const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function updateMaterials() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB");

    // Update Chemistry Unit 4: Chemical Kinetics
    await Material.updateOne(
      { subject: "Chemistry", topic: "Unit 4: Chemical Kinetics" },
      {
        videoLink: "https://www.youtube.com/watch?v=7Lf1iF8z4_U",
        pdfLink: "https://www.askiitians.com/iit-jee-physical-chemistry/chemical-kinetics/chemical-kinetics-notes.pdf"
      }
    );

    // Update Chemistry Unit 5: Organic Chemistry
    await Material.updateOne(
      { subject: "Chemistry", topic: "Unit 5: Organic Chemistry" },
      {
        videoLink: "https://www.youtube.com/watch?v=2H5tLI__sZ0",
        pdfLink: "https://www.askiitians.com/iit-jee-organic-chemistry/introduction-to-organic-chemistry/organic-chemistry-notes.pdf"
      }
    );

    // Update Maths Unit 5: Geometry
    await Material.updateOne(
      { subject: "Maths", topic: "Unit 5: Geometry" },
      {
        videoLink: "https://www.youtube.com/watch?v=JnZZaZc9VyE",
        pdfLink: "https://www.mathsisfun.com/geometry/euclidean-geometry.html"
      }
    );

    // Update Biology Unit 5: Ecosystems
    await Material.updateOne(
      { subject: "Biology", topic: "Unit 5: Ecosystems" },
      {
        videoLink: "https://www.youtube.com/watch?v=oHkUdLO4eEE",
        pdfLink: "https://www.biologyonline.com/articles/ecosystem-basics"
      }
    );

    console.log("Materials updated successfully!");

    // Verify the updates
    const updatedMaterials = await Material.find({
      $or: [
        { subject: "Chemistry", topic: { $in: ["Unit 4: Chemical Kinetics", "Unit 5: Organic Chemistry"] } },
        { subject: "Maths", topic: "Unit 5: Geometry" },
        { subject: "Biology", topic: "Unit 5: Ecosystems" }
      ]
    });

    console.log("\nUpdated materials:");
    updatedMaterials.forEach(mat => {
      console.log(`${mat.subject} - ${mat.topic}:`);
      console.log(`  Video: ${mat.videoLink}`);
      console.log(`  PDF: ${mat.pdfLink}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

updateMaterials();