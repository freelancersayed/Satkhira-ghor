const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://sayedhossainfs_db_user:i1lLSReqrfw93Iws@satkhiraghor.etqffve.mongodb.net/satkhir_ghor?retryWrites=true&w=majority';

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  jfif: 'image/jpeg',
  ico: 'image/x-icon',
};

async function syncMedia() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('media');

  // Create unique index on filename
  await col.createIndex({ filename: 1 }, { unique: true });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const files = fs.readdirSync(uploadDir).filter(f => f !== '.gitkeep');

  console.log('Syncing ' + files.length + ' files to MongoDB Media collection...');
  let count = 0;

  for (const filename of files) {
    const filePath = path.join(uploadDir, filename);
    const data = fs.readFileSync(filePath);
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME_TYPES[ext] || 'image/jpeg';

    await col.updateOne(
      { filename },
      {
        $set: {
          filename,
          data,
          contentType,
          size: data.length,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    count++;
    console.log('Synced ' + count + '/' + files.length + ': ' + filename);
  }

  console.log('Successfully synced all ' + count + ' images into MongoDB Media collection!');
  await mongoose.disconnect();
}

syncMedia().catch(console.error);
