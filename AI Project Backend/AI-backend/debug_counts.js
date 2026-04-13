const mongoose = require("mongoose");
const SignInUser = require('./UserSchema');
const Subject = require('./Subject');
const Topic = require('./Topics'); 
const Material = require('./Materials');

mongoose.connect("mongodb://localhost:27017/AIuser").then(async () => {
    console.log("Connected to MongoDB");
    
    const faculties = await SignInUser.find({ role: "faculty" });
    const allTopics = await Topic.find({});
    const allStudentSubjects = await Subject.find({});
    const allMaterials = await Material.find({});
    
    console.log(`Faculties: ${faculties.length}`);
    console.log(`Topics: ${allTopics.length}`);
    console.log(`Student Subjects (Units): ${allStudentSubjects.length}`);
    console.log(`Materials: ${allMaterials.length}`);
    
    for (const faculty of faculties) {
        if (!faculty.subject) {
            console.log(`Faculty ${faculty.name} has no subject assigned.`);
            continue;
        }
        const subjectName = faculty.subject.trim();
        console.log(`Checking subject: "${subjectName}" for Faculty: ${faculty.name}`);
        
        const uniqueUnits = new Set();
        
        allTopics.forEach(t => {
            if (t.subject && t.subject.trim().toLowerCase() === subjectName.toLowerCase()) {
                uniqueUnits.add(t.topicName.trim().toLowerCase());
            }
        });
        
        allStudentSubjects.forEach(s => {
            if (s.name && s.name.trim().toLowerCase() === subjectName.toLowerCase() && s.title) {
                uniqueUnits.add(s.title.trim().toLowerCase());
            }
        });

        allMaterials.forEach(m => {
            if (m.subject && m.subject.trim().toLowerCase() === subjectName.toLowerCase() && m.topic) {
                uniqueUnits.add(m.topic.trim().toLowerCase());
            }
        });
        
        console.log(`-> Found ${uniqueUnits.size} unique units:`, Array.from(uniqueUnits));
    }
    
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
