import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService){}

    async changePassword(data, req) {
        try{
            const user = await this.prisma.user.findUnique({where : { email : req.user.email }})
            if (user)
            {
                const hash = await argon.hash(data.password);
                await this.prisma.user.update(
                    {where : {
                        id : user.id
                    },
                    data : {
                        password : hash
                    }
                }
                )
            }
        }catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'can\'t change the password , try another username',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
        }
    }


    async getListOfliked(id) {
        try {
            return await this.prisma.user.findUnique({
                where : {id : id }
            })
        }  catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'can\'t change the password , try another username',
            }, HttpStatus.FORBIDDEN, {
                cause: error
            });
        } 
    }
}
