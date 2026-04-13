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
    console.log("--- Testing /ping ---");
    const rp = await fetchData("http://localhost:5050/ping");
    console.log("Status:", rp.status);
    console.log("Body:", JSON.stringify(rp.body, null, 2));

    console.log("\n--- Testing /students/all ---");
    const r1 = await fetchData("http://localhost:5050/students/all");
    console.log("Status:", r1.status);
    console.log("Body Count:", Array.isArray(r1.body) ? r1.body.length : "Not an array");

  } catch (err) {
    console.error("Test Error:", err);
  }
}
runTest();
