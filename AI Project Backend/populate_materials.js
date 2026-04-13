const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");

async function populateMaterials() {
    try {
        await mongoose.connect("mongodb://localhost:27017/academic_platform");
        console.log("Connected to MongoDB");

        // Clear existing materials
        await Material.deleteMany({});
        console.log("Cleared existing materials");

        const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"];
        const topics = {
            "Physics": ["Ampere's Law", "Newton's Laws", "Waves", "Quantum Physics", "Spectrum Analysis"],
            "Chemistry": ["Organic Chemistry", "Atomic Structure", "Thermodynamics", "Electrochemistry", "Biochemistry"],
            "Mathematics": ["Algebra", "Geometry", "Calculus", "Statistics", "Linear Equations"],
            "Biology": ["Genetics", "Cell Biology", "Ecology", "Human Biology", "Evolution"],
            "Computer Science": ["Programming", "Data Structures", "Algorithms", "Databases", "Web Development"]
        };

        // Predefined educational links for each subject and topic
        const materialLinks = {
            "Physics": {
                "Ampere's Law": { video: "https://youtu.be/UmqdeuzeFCc?si=MB4o8VK3zAw23Une", pdf: "https://www.uomus.edu.iq/img/lectures21/MUCLecture_2022_51025760.pdf" },
                "Newton's Laws": { video: "https://www.youtube.com/watch?v=kKKM8Y-u7ds", pdf: "https://vijayacollege.ac.in/wp-content/uploads/2021/05/Newton-laws-of-motion-I-Sem-2020-21.pdf" },
                "Waves": { video: "https://youtu.be/CVsdXKO9xlk", pdf: "http://structuredindependentlearning.com/docs/P30%20Lessons/P30%20Lessons%20pdf/L33%20Wave%20particle%20nature.pdf" },
                "Quantum Physics": { video: "https://youtu.be/6YdDstbjsKQ?si=KEPPruqO_rBGjyPG", pdf: "https://www.mmmut.ac.in/News_content/02110tpnews_11232020.pdf" },
                "Spectrum Analysis": { video: "https://youtu.be/BUYeQa_-ojk?si=sUDG5EmTvugVDZjp", pdf: "https://www.ele.uva.es/~lourdes/docencia/Master_IE/Fundamentals_of_Spectrum_Analysis[2].pdf" }
            },
            "Chemistry": {
                "Organic Chemistry": { video: "https://youtu.be/dqX0a2v8kKs", pdf: "https://www.chem.libretexts.org/@api/deki/files/12345/Organic_Chemistry_Basics.pdf" },
                "Atomic Structure": { video: "https://youtu.be/ThLv2U-AwOA", pdf: "https://www.khanacademy.org/science/chemistry/atomic-structure-and-properties" },
                "Thermodynamics": { video: "https://youtu.be/8fY2C5J5K8M", pdf: "https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry)/Thermodynamics" },
                "Electrochemistry": { video: "https://youtu.be/4Eo7m7l6N9g", pdf: "https://www.acs.org/content/dam/acsorg/education/students/highschool/chemistryclubs/infographics/electrochemistry.pdf" },
                "Biochemistry": { video: "https://youtu.be/2pR8v8Hq7Ks", pdf: "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Book%3A_Organic_Chemistry_with_a_Biological_Emphasis" }
            },
            "Mathematics": {
                "Algebra": { video: "https://youtu.be/OxJWrO_A0KY", pdf: "https://www.mathsisfun.com/algebra/" },
                "Geometry": { video: "https://youtu.be/6pV9dgY3m8A", pdf: "https://www.khanacademy.org/math/geometry" },
                "Calculus": { video: "https://youtu.be/9vKqVkMQHKk", pdf: "https://www.mathsisfun.com/calculus/" },
                "Statistics": { video: "https://youtu.be/4kBvxE3W8Nk", pdf: "https://www.statisticssolutions.com/wp-content/uploads/2014/09/probability-and-statistics.pdf" },
                "Linear Equations": { video: "https://youtu.be/7t9UhJ5VdPE", pdf: "https://www.mathsisfun.com/algebra/linear-equations.html" }
            },
            "Biology": {
                "Genetics": { video: "https://youtu.be/8WkqB9Xp6qk", pdf: "https://www.khanacademy.org/science/biology/classical-genetics" },
                "Cell Biology": { video: "https://youtu.be/URUJD5NEXC8", pdf: "https://www.ncbi.nlm.nih.gov/books/NBK21059/" },
                "Ecology": { video: "https://youtu.be/LEpTTolebqo", pdf: "https://www.khanacademy.org/science/biology/cell-structure-and-function" },
                "Human Biology": { video: "https://youtu.be/9kOGOY7vthk", pdf: "https://www.khanacademy.org/science/biology/ecology" },
                "Evolution": { video: "https://youtu.be/0ZGbIKd0XrM", pdf: "https://www.khanacademy.org/science/biology/human-biology" }
            },
            "Computer Science": {
                "Programming": { video: "https://youtu.be/zOjov-2OZ0E", pdf: "https://www.geeksforgeeks.org/introduction-to-programming-languages/" },
                "Data Structures": { video: "https://youtu.be/8aGhZQkoFbQ", pdf: "https://www.geeksforgeeks.org/data-structures/" },
                "Algorithms": { video: "https://youtu.be/2E7Ym9Z8X0Y", pdf: "https://www.geeksforgeeks.org/introduction-to-algorithms/" },
                "Databases": { video: "https://youtu.be/4Xt7T0QNrKc", pdf: "https://www.geeksforgeeks.org/database-management-system-set-1/" },
                "Web Development": { video: "https://youtu.be/3QDt6Y_KOyw", pdf: "https://www.geeksforgeeks.org/web-development/" }
            }
        };

        const materials = [];

        for (const subject of subjects) {
            const subjectTopics = topics[subject];
            for (const topic of subjectTopics) {
                const links = materialLinks[subject][topic];
                const material = {
                    subject: subject,
                    topic: topic,
                    content: `${subject} - ${topic}: Comprehensive study material covering all essential concepts and topics.`,
                    videoLink: links.video,
                    pdfLink: links.pdf
                };
                materials.push(material);
            }
        }

        await Material.insertMany(materials);
        console.log(`Successfully populated ${materials.length} materials (5 per subject)`);

        // Verify the data
        const count = await Material.countDocuments();
        console.log(`Total materials in database: ${count}`);

        const bySubject = await Material.aggregate([
            { $group: { _id: "$subject", count: { $sum: 1 } } }
        ]);
        console.log("Materials by subject:", bySubject);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

populateMaterials();