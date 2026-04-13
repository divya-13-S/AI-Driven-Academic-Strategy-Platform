const mongoose = require("mongoose");
const SignInUser = require("./UserSchema");

async function migrateAccounts() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: "accounts" }).toArray();

        if (collections.length === 0) {
            console.log("No 'accounts' collection found. Skipping migration.");
            process.exit(0);
        }

        console.log("Found 'accounts' collection. Starting migration...");

        const accountsCollection = db.collection("accounts");
        const accounts = await accountsCollection.find({}).toArray();

        console.log(`Found ${accounts.length} records in 'accounts'.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const account of accounts) {
            const existingUser = await SignInUser.findOne({ email: account.email });

            if (existingUser) {
                console.log(`User with email ${account.email} already exists in 'users'. Skipping.`);
                skippedCount++;
            } else {
                const newUser = new SignInUser({
                    name: account.name || "Unknown",
                    email: account.email,
                    password: account.password || "defaultPassword123",
                    role: account.role || "student",
                    subject: account.subject || "",
                    status: account.status || "Active"
                });

                await newUser.save();
                console.log(`Migrated user: ${account.email}`);
                migratedCount++;
            }
        }

        console.log(`Migration completed: ${migratedCount} migrated, ${skippedCount} skipped.`);
        
        // Optionally drop the accounts collection after migration
        // await accountsCollection.drop();
        // console.log("'accounts' collection dropped.");

    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

migrateAccounts();
