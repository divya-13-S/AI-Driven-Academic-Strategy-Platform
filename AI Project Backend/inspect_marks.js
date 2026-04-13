const mongoose = require('mongoose');
const Subject = require('./AI-backend/Subject');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/AIuser');
  const count = await Subject.countDocuments();
  console.log('TOTAL SUBJECT RECORDS', count);
  const bySubject = await Subject.aggregate([
    { $group: { _id: '$name', count: { $sum: 1 } } }
  ]);
  console.log('BY SUBJECT', JSON.stringify(bySubject, null, 2));
  const bySubjectTopic = await Subject.aggregate([
    { $group: { _id: { name: '$name', title: '$title' }, count: { $sum: 1 } } },
    { $sort: { '_id.name': 1, '_id.title': 1 } }
  ]);
  console.log('BY SUBJECT/TOPIC', JSON.stringify(bySubjectTopic, null, 2));
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });