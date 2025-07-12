import { Inject, Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@Inject('MONGO_CLIENT') private readonly client: MongoClient) {}

  async loginUser(userDto: LoginUserDto): Promise<any> {
    const db = this.client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({
      email: userDto.email,
    });

    if(!existingUser){
      throw new UnauthorizedException('user not registered');
    }

    const value = await compare(userDto.password, existingUser.password);

    if(!value){
      throw new UnauthorizedException('username or password is not registered');
    }

    return existingUser;
  }

  async registerUser(userDto: RegisterUserDto): Promise<{ id: string }> {
    const db = this.client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({
      $or: [{ phone: userDto.phone }, { email: userDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await hash(userDto.password, saltRounds);

    const result = await usersCollection.insertOne({
      ...userDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { id: result.insertedId.toString() };
  }
}
