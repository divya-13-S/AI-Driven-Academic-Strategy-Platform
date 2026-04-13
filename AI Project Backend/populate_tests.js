const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/AIuser").then(async () => {
    const SignInUser = require('./AI-backend/UserSchema');
    const Subject = require('./AI-backend/Subject');
    const ExamSchedule = require('./AI-backend/ExamSchedule');

    console.log("Connected to DB.");

    const faculties = await SignInUser.find({ role: 'faculty' });
    const subjects = faculties.map(f => f.subject).filter(s => s);
    const students = await SignInUser.find({ role: { $regex: /^student$/i } });
    
    console.log("Subjects to populate:", subjects);
    console.log("Total students found:", students.length);

    // Units and Exams
    const tests = [
        { unit: "Unit 1", examName: "Unit Test 1", offsetDays: -10 }, // Past exam
        { unit: "Unit 2", examName: "Unit Test 2", offsetDays: -2 },  // Past exam
        { unit: "Unit 3", examName: "Unit Test 3", offsetDays: 5 }    // Future/Recent exam (just have marks anyway)
    ];

    let marksCount = 0;
    let scheduleCount = 0;

    for (const subjectName of subjects) {
        for (const test of tests) {
            // Upsert ExamSchedule
            let examDate = new Date();
            examDate.setDate(examDate.getDate() + test.offsetDays);
            
            await ExamSchedule.findOneAndUpdate(
                { subject: subjectName, unit: test.unit, examName: test.examName },
                { examDate: examDate },
                { upsert: true, new: true }
            );
            scheduleCount++;

            // Give marks to all students for this (subject, unit, exam)
            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                let mark;
                
                // 15% chance of being absent, else random 40-100 mark
                if (Math.random() < 0.15) {
                    mark = "ABS";
                } else {
                    mark = Math.floor(Math.random() * 61) + 40; // 40 to 100
                    mark = mark.toString();
                }

                await Subject.findOneAndUpdate(
                    { userId: student._id.toString(), name: subjectName, title: test.unit },
                    { marks: mark, exam: test.examName },
                    { upsert: true, new: true }
                );
                marksCount++;
            }
        }
    }
    
    console.log(`Successfully populated ${scheduleCount} exam schedules and ${marksCount} marks entries.`);
    process.exit(0);
}).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
