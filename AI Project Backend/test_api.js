const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:5050/materials?subject=Maths&topic=Unit%201:%20Trigonometry');
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();