const mongoose = require("mongoose");
const Material = require("./Materials");

async function checkMaterials() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const materials = await Material.find({});
        const subjects = [...new Set(materials.map(m => m.subject))];
        console.log("Subjects with materials:", subjects);
        materials.forEach(m => {
            console.log(`- [${m.subject}] Unit: ${m.topic} (Video: ${!!m.videoLink}, PDF: ${!!m.pdfLink})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
checkMaterials();
