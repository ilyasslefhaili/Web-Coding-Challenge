import {  PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authDTO } from 'src/dto/auth.dto';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config:ConfigService
  ) {}

  async signUp(signUpDto: authDTO) {
    const hash = await argon.hash(signUpDto.password);
    try{
      console.log(hash)

      var user = await this.prisma.user.create({
        data: {
          email : signUpDto.email,
          password: hash,
        },
      });
      console.log(hash)

      delete user.password

      return user;
    }
    catch(error)
    {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'try another username',
      }, HttpStatus.FORBIDDEN, {
        cause: error
      });
    }
  }

  async signIn(signInDto: authDTO) {

    const user = await this.prisma.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }


    const passwordVerify = await argon.verify(
      user.password,
      signInDto.password,
    );

    if (!passwordVerify) {
      throw new ForbiddenException('Wrong credentials');
    }

    return {'access-token' : await this.signToken(user.id, user.email)};
  }
  async signToken(userId: number, email: string) {
    const payload = {sub :userId, email}

    const secret = this.config.get('SECRET_JWT')
    const expiresIn = this.config.get('EXPIRESIN')

    const token =  await this.jwt.signAsync(payload, {
      expiresIn : expiresIn,
      secret : secret
    })
    return token
  }


}
