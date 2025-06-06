import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) { }

  async registerUser(userDto: RegisterUserDto): Promise<{ id: string }> {
    const db = this.client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({
      $or: [{ phone: userDto.phone }, { email: userDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('User with given phone or email already exists');
    }

    const result = await usersCollection.insertOne({
      ...userDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    return { id: result.insertedId.toString() };
  }
}
