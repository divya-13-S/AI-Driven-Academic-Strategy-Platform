const mongoose = require("mongoose");

async function searchEverywhere() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB\n");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const collInfo of collections) {
            const collName = collInfo.name;
            const collection = db.collection(collName);
            
            // Search for anything with "chemistry" in any field
            const results = await collection.find({
                $or: [
                    { subject: /chemistry/i },
                    { name: /chemistry/i },
                    { topic: /chemistry/i },
                    { title: /chemistry/i },
                    { topicName: /chemistry/i }
                ]
            }).toArray();

            if (results.length > 0) {
                console.log(`--- Collection: ${collName} (Match Count: ${results.length}) ---`);
                results.forEach(r => {
                    console.log(JSON.stringify(r, null, 2));
                });
            }
        }

        console.log("\nSearch completed.");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
searchEverywhere();
