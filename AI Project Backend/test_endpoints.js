const fetch = require("node-fetch");

async function testEndpoints() {
    try {
        console.log("Testing students/all...");
        const res1 = await fetch("http://localhost:5050/students/all");
        console.log("Status:", res1.status);
        const data1 = await res1.json();
        console.log("Data 1 (first 2):", JSON.stringify(data1.slice(0, 2), null, 2));

        const subject = "Physics";
        console.log(`\nTesting faculty/students/${subject}...`);
        const res2 = await fetch(`http://localhost:5050/faculty/students/${subject}`);
        console.log("Status:", res2.status);
        const data2 = await res2.json();
        console.log("Data 2 (first 2):", JSON.stringify(data2.slice(0, 2), null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}
testEndpoints();
