import { Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';

const MONGO_CLIENT = {
  provide: 'MONGO_CLIENT',
  useFactory: async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  },
};

@Module({
  providers: [MONGO_CLIENT],
  exports: [MONGO_CLIENT],
})
export class MongodbModule {}
