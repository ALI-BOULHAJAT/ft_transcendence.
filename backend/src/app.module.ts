import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './users/user.service';
import { PrismaService } from './prisma.service';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { MembersModule } from './members/members.module';
import { ChatGateway } from './chat.gateway';
import { GameModule } from './game/game.module';
import { GatewayModule } from './game/gateway/gateway.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    RoomsModule,
    MessagesModule,
    MembersModule,
    GameModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService, ChatGateway],
  exports: [UserService, PrismaService],
})
export class AppModule {}
