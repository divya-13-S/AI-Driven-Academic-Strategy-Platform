const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");
const Topic = require("./AI-backend/Topics");
const Subject = require("./AI-backend/Subject");
const SignInUser = require("./AI-backend/UserSchema");

async function normalize() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const canonicalSubjects = {
            "physics": "Physics",
            "chemistry": "Chemistry",
            "biology": "Biology",
            "maths": "Maths",
            "mathematics": "Maths"
        };

        const collections = [
            { model: Material, fields: ["subject", "topic"] },
            { model: Topic, fields: ["subject", "topicName"] },
            { model: Subject, fields: ["name", "title"] },
            { model: SignInUser, fields: ["subject"] }
        ];

        for (const col of collections) {
            const records = await col.model.find({});
            for (const record of records) {
                let changed = false;
                for (const field of col.fields) {
                    if (record[field] && typeof record[field] === "string") {
                        const trimmed = record[field].trim();
                        let normalized = trimmed;
                        
                        // If it's a subject field, normalize case
                        if (field === "subject" || field === "name") {
                            const low = trimmed.toLowerCase();
                            if (canonicalSubjects[low]) {
                                normalized = canonicalSubjects[low];
                            }
                        }

                        if (normalized !== record[field]) {
                            record[field] = normalized;
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    await record.save();
                    console.log(`Normalized ${col.model.modelName} ID: ${record._id}`);
                }
            }
        }

        console.log("\nNormalization completed successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
normalize();
