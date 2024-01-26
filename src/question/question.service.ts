import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService){}

    async add(data) {
        try {
            const user = await this.prisma.user.findUnique({where : {id : data.userId}}) 
            await this.prisma.question.create(
                {
                    data : {
                        title : data.title,
                        content : data.content,
                        user : { connect : {id : user.id}}
                    }
                }
            )
            return {'message' : 'created'}

        }catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'try again',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
        }
    }

    async getById(data) {
        try {
            var id = parseInt(data)
            return await this.prisma.question.findUnique({where : { id : id} , include : {Answer : true}})
        }catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'try again',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
        }
    }


    async likeQuestion(data) {
        try {
            const questionWithLikes = await this.prisma.question.findUnique({
                where: { id: data.questionId },
            });
            const likeCount = questionWithLikes?.like.length || 0;

            return likeCount;
            
        }catch(error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'question id not found, tru another id',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
        }
    }
}
