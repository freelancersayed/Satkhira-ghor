import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless executions.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const rawUri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  // In production (e.g. Vercel), MONGODB_URI is strictly required from environment variables
  if (!rawUri && isProduction) {
    throw new Error(
      'MONGODB_URI ভ্যারিয়েবলটি Vercel-এ পাওয়া যায়নি। দয়া করে Vercel Dashboard -> Project Settings -> Environment Variables-এ MONGODB_URI যুক্ত করুন।'
    );
  }

  // Fallback to local MongoDB only during local development
  const uri = rawUri ? rawUri.trim() : 'mongodb://127.0.0.1:27017/satkhir_ghor';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Fail fast if cluster is unreachable (10s)
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        if (err.name === 'MongoServerSelectionError' || err.message?.includes('whitelisted')) {
          console.error(
            'MongoDB Atlas Network Access Error: MongoDB Atlas-এ Network Access -> "0.0.0.0/0" (Allow from Anywhere) সেট করা আছে কিনা নিশ্চিত করুন।'
          );
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
