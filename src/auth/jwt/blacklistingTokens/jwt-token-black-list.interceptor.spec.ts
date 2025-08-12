import { JwtTokenBlackListInterceptor } from './jwt-token-black-list.interceptor';
import { MongoClient, Db, Collection } from 'mongodb';

describe('JwtTokenBlackListInterceptor', () => {
  let mockClient: Partial<MongoClient>;
  let mockCollection: Partial<Collection>;
  let mockDb: Partial<Db>;

  beforeEach(() => {
    mockCollection = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb as Db),
    };
  });

  it('should be defined', () => {
    const interceptor = new JwtTokenBlackListInterceptor(
      mockClient as MongoClient,
    );
    expect(interceptor).toBeDefined();
  });
});
