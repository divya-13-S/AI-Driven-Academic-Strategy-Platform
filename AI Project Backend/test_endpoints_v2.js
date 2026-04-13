const http = require("http");

function fetchData(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on("error", (err) => reject(err));
  });
}

async function runTest() {
  try {
    console.log("--- Testing /students/all ---");
    const r1 = await fetchData("http://localhost:5050/students/all");
    console.log("Status:", r1.status);
    console.log("Body:", JSON.stringify(r1.body, null, 2).substring(0, 500));

    console.log("\n--- Testing /faculty/students/Physics ---");
    const r2 = await fetchData("http://localhost:5050/faculty/students/Physics");
    console.log("Status:", r2.status);
    console.log("Body:", JSON.stringify(r2.body, null, 2).substring(0, 500));

  } catch (err) {
    console.error("Test Error:", err);
  }
}
runTest();
