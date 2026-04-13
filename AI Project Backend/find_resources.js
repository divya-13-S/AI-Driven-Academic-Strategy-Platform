const mongoose = require("mongoose");

async function findResources() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        
        // Search in all collections for any record with videoLink or pdfLink
        const collections = await db.listCollections().toArray();
        for (const collInfo of collections) {
            const collName = collInfo.name;
            const collection = db.collection(collName);
            const results = await collection.find({
                $or: [
                    { videoLink: { $exists: true } },
                    { pdfLink: { $exists: true } },
                    { link: { $exists: true } },
                    { url: { $exists: true } }
                ]
            }).toArray();

            if (results.length > 0) {
                console.log(`\n--- Collection: ${collName} (Match Count: ${results.length}) ---`);
                results.forEach(r => {
                    console.log(`ID: ${r._id}, Subject: ${r.subject || r.name || 'N/A'}, Topic: ${r.topic || r.title || 'N/A'}`);
                    if (r.videoLink) console.log(`  Video: ${r.videoLink}`);
                    if (r.pdfLink) console.log(`  PDF: ${r.pdfLink}`);
                });
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
findResources();
