/**
 * WebSocket 网关
 * WebSocket Gateway
 * 
 * 提供实时通信能力，支持 AI 分析推送等功能
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebsocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('auth')
  handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string },
  ) {
    client.join(`user:${data.token}`);
    return { event: 'auth', data: { success: true } };
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    client.join(`user:${data.userId}`);
    return { event: 'subscribed', data: { success: true } };
  }

  sendAIAnalysis(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('ai:analysis', data);
  }

  sendInventoryAlert(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('inventory:alert', data);
  }

  sendDailyReport(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('report:daily', data);
  }
}
