const mongoose = require("mongoose");
const SignInUser = require('./UserSchema');
const Subject = require('./Subject');
const Topic = require('./Topics'); 
const Material = require('./Materials');

mongoose.connect("mongodb://localhost:27017/AIuser").then(async () => {
    console.log("Connected to MongoDB");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available Collections:", collections.map(c => c.name));

    const totalUsers = await SignInUser.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const totalMaterials = await Material.countDocuments();

    console.log(`SignInUser count: ${totalUsers}`);
    console.log(`Subject count: ${totalSubjects}`);
    console.log(`Topic count: ${totalTopics}`);
    console.log(`Material count: ${totalMaterials}`);

    if (totalTopics > 0) {
        const sampleTopic = await Topic.findOne();
        console.log("Sample Topic:", JSON.stringify(sampleTopic, null, 2));
    }
    if (totalSubjects > 0) {
        const sampleSubject = await Subject.findOne();
        console.log("Sample Subject:", JSON.stringify(sampleSubject, null, 2));
    }

    // List all subjects in the Subject collection
    const allSubjects = await Subject.find({});
    const subjectMap = {};
    allSubjects.forEach(s => {
        const name = s.name || "NO_NAME";
        if (!subjectMap[name]) subjectMap[name] = new Set();
        if (s.title) subjectMap[name].add(s.title.trim().toLowerCase());
    });

    console.log("Subject-wise Unique Titles in 'Subject' collection:");
    for (const name in subjectMap) {
        console.log(`${name}: ${subjectMap[name].size} [${Array.from(subjectMap[name]).join(", ")}]`);
    }

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
