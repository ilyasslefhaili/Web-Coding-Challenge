import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnswerService {
    constructor(private readonly prisma:PrismaService){}

    async add(data) {
        try {
            const question = await this.prisma.question.findUnique({where : {id : data.questionId}})
            await this.prisma.answer.create(
                {
                    data : {
                        description : data.description,
                        question : {
                            connect : {id : question.id}
                        }
                    }
                }
            )
            return {'message' : 'added'}

        }catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'try again',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
        }
    }
}
