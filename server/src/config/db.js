import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    throw new Error('ATLAS_URI is missing. Add it to server/.env or Render env vars.');
  }

  await mongoose.connect(uri, {
    dbName: 'scholarai',
  });

  isConnected = true;
  console.log('MongoDB Atlas connected');
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
