import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Req, UseGuards } from '@nestjs/common';
import { DbService } from 'src/prisma/db.service';

@WebSocketGateway({ namespace: 'notification', cors: { origin: '*' } })
export class NotificationService implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: DbService,
  ) {}

  @WebSocketServer()
  server: Server;

  private socketIdMap: Map<string, string> = new Map();
  @SubscribeMessage('send')
  @UseGuards(AuthGuard('websocket-jwt'))
  sendNotification(@MessageBody() data: string, @Req() req): string {
    const userEmail = req.user.email;
    const socketId = this.socketIdMap.get(userEmail);

    if (socketId) {
      this.server.to(socketId).emit('receive', data);
      return 'sent';
    } else {
      return 'not connected';
    }
  }

  @SubscribeMessage('receive') 
  recieveNotification(@MessageBody() data: string): string {
    return data;
  }


  @UseGuards(AuthGuard('websocket-jwt'))
  async handleConnection(@ConnectedSocket() client: Socket,  @Req() req) {
    try {
      const token = client.handshake.headers.authorization?.slice(7);

      if (!token) {
        throw new Error('error');
      }

      const payload = await this.jwt.verifyAsync(token);
      const userEmail = payload.email;
      this.socketIdMap.set(userEmail, client.id);
    } catch (error) {

      console.error('connection failed:', error);
      client.disconnect();
    }
  }
}
