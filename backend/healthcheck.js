const { MongoClient } = require('mongodb');

async function healthCheck() {
  const mongoURI = process.env.MONGODB_URI;
  let client;

  try {
    client = new MongoClient(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    await client.db('admin').command({ ping: 1 });

    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

healthCheck();