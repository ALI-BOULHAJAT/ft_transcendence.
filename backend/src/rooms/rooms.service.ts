import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Messages, Rooms, UserType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateRoomDto } from './dtos/UpdateRoomDto';
import { MembersService } from 'src/members/members.service';
import { MessagesService } from 'src/messages/messages.service';

enum RoomType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}
@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private membersservice: MembersService,
    private messageservice: MessagesService,
  ) {}
  // check if member is in room
  async isMemberInRoom(roomId: string, userId: string) {
    console.log('++isMemberInRoom++roomId>', roomId);
    console.log('++isMemberInRoom++userId>', userId);
    const room = await this.prisma.rooms.findUnique({
      where: { id: roomId },
      include: { members: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    const member = room.members.find((member) => member.userId === userId);
    if (!member) {
      throw new NotFoundException(
        `User with ID ${userId} is not a member of room with ID ${roomId}`,
      );
    }
    return member;
  }
  async findOne(params: { name: string }): Promise<Rooms> {
    try {
      const { name } = params;
      // console.log('++findOne++>', name);
      const room = await this.prisma.rooms.findUnique({
        where: { id: name },
      });
      if (!room) throw new Error('');
      return room;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findAll(): Promise<Rooms[]> {
    return this.prisma.rooms.findMany({
      include: {
        members: true,
        messages: true,
      },
    });
  }

  async findUserRooms(userId: string) {
    const __User = await this.prisma.user.findUnique({
      where: { login: userId },
    });
    if (!__User)
      throw new NotFoundException(`User with ID ${userId} not found`);

    const rooms = await this.prisma.rooms.findMany({
      where: {
        members: {
          some: {
            userId: __User.id,
          },
        },
      },
      include: {
        members: true,
        messages: true,
      },
    });

    console.log('++findUserRooms+%s +>', __User.login, rooms);
    return rooms;
  }
  // this is the function that create room and add members to it
  async create(
    _data: {
      name: string;
      type: RoomType;
      friends: UserType[];
      channeLpassword?: string;
    },
    userId: string,
  ) {
    try {
      // console.log('++create+data+>', _data);
      // console.log('++create+userId+>', userId);
      return await this.prisma.$transaction(async (prisma) => {
        // console.log('++data : ', _data);
        const room = await prisma.rooms.create({
          data: {
            name: _data.name,
            type: _data.type,
            password: _data.channeLpassword,
            members: {
              create: _data.friends.map((friend: any) => ({
                user: {
                  connect: { id: friend.id },
                },
                type: friend.role,
              })),
            },
          },
        });
        // console.log('***** +> _data.friends.length :', _data.friends.length);
        for (let index = 0; index < _data.friends.length; index++) {
          const element: any = _data.friends[index];
          // console.log('++_data.friends[index]+>', element);
          await prisma.user.update({
            where: { id: element.id },
            data: {
              Rooms: {
                connect: { id: room.id },
              },
            },
          });
        }
        return room;
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async update(params: { id: string; data: UpdateRoomDto }): Promise<Rooms> {
    const { id, data } = params;
    // console.log('++update++>', id);

    return await this.prisma.rooms.update({
      data,
      where: { id },
    });
  }

  async remove(id: string): Promise<Rooms> {
    // console.log('++remove++>', id);

    try {
      const room = await this.prisma.rooms.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }

      // Delete all associated Members entities first
      const mmrs = await this.prisma.members.deleteMany({
        where: { roomsId: id },
      });
      // console.log('mmrs :', mmrs);

      // Delete all associated Members entities first
      const rms = await this.prisma.messages.deleteMany({
        where: { roomsId: id },
      });
      // console.log('rms :', rms);

      return await this.prisma.rooms.delete({
        where: { id },
      });
    } catch (error) {
      // console.log('+++> error :', error);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `CAN'T ROMOVE ROOM ${id}`,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async AddMessage(dep: {
    roomId: string;
    content: string;
    userId: string;
  }): Promise<Rooms> {
    try {
      const User = await this.prisma.user.findUnique({
        where: { id: dep.userId },
      });
      const roomIId = await this.prisma.rooms.findUnique({
        where: { id: dep.roomId },
      });
      // console.log('User :', User);
      // console.log('roomIId :', roomIId);

      const message = await this.prisma.messages.create({
        data: {
          content: dep.content,
          sender: {
            connect: { id: User.id },
          },
          roomId: {
            connect: { id: roomIId.id },
          },
        },
      });

      // console.log('message :', message);
      const room = this.prisma.rooms.update({
        where: { id: dep.roomId },
        data: {
          messages: {
            connect: { id: message.id },
          },
          members: {
            connect: { id: User.id },
          },
        },
        include: {
          messages: true,
        },
      });
      return room;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: "CAN'T CREATE THIS MESSAGE",
        },
        HttpStatus.CONFLICT,
        {
          cause: error,
        },
      );
    }
  }

  async JoinUser(params: { userId: string; roomId: string }) {
    try {
      // const User = await this.prisma.user.findUnique({
      //   where: { id: params.userId },
      // });
      const Member = await this.prisma.members.create({
        data: {
          user: {
            connect: { id: params.userId },
          },
          RoomId: {
            connect: { id: params.roomId },
          },
          type: 'USER',
        },
      });
      return await this.prisma.rooms.update({
        data: {
          members: {
            connect: { id: Member.id },
          },
        },
        where: {
          id: params.roomId,
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "CAN'T EDIT THIS MESSAGE",
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }
  async UpdateMessage(params: {
    messageId: string;
    content: string;
  }): Promise<Messages> {
    try {
      const message = await this.prisma.messages.update({
        where: {
          id: params.messageId,
        },
        data: { content: params.content },
      });
      return message;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "CAN'T EDIT THIS MESSAGE",
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async DeleteMessage(params: { messageId: string }): Promise<Messages> {
    try {
      const message = await this.prisma.messages.delete({
        where: { id: params.messageId },
      });
      return message;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'NO MESSAGE WIDTH THIS ID',
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }
  async getaLLmessages(messageId: string) {
    try {
      const message = await this.prisma.rooms.findUnique({
        where: { id: messageId },
        select: {
          messages: true,
        },
      });
      // console.log('message :', message);
      return message;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'NO MESSAGE WIDTH THIS ID',
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  async addMemberToRoom(
    userId: string,
    roomId: string,
    userType: UserType = 'USER',
  ) {
    const newMember = await this.prisma.members.create({
      data: {
        user: { connect: { id: userId } },
        RoomId: { connect: { id: roomId } },
        type: userType,
      },
    });

    return newMember;
  }
}
