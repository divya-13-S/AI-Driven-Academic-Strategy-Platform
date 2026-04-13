const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");
const Topic = require("./AI-backend/Topics");
const Subject = require("./AI-backend/Subject");
const SignInUser = require("./AI-backend/UserSchema");

async function clean() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

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
                        if (trimmed !== record[field]) {
                            record[field] = trimmed;
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    await record.save();
                    console.log(`Updated ${col.model.modelName} ID: ${record._id}`);
                }
            }
        }

        console.log("\nDatabase cleaning completed!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
clean();
