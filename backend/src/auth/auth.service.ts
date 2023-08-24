import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signInWithLogin(login: string, password: string) {
    const userExists = await this.usersService.findOneLogin({
      login,
    });
    if (!userExists) {
      return null;
    }
    console.log('async signInWithLogin :', userExists);
    if (userExists.password === password) {
      const token = await this.generateJwt({
        login: userExists.login,
        email: userExists.email,
        avatar: userExists.avatar,
        name: userExists.name,
        banner: userExists.banner,
        intraId: userExists.intraId,
      });
      return {
        userId: userExists,
        token: token.accessToken,
      };
    }
  }
  async signIn(user: Prisma.UserUncheckedCreateInput) {
    // if (!user) {
    //   throw new BadRequestException('Unauthenticated');
    // }
    console.log('+++++++++++++++> ana hna');
    const userExists = await this.usersService.findOneLogin({
      login: user.login,
    });

    if (!userExists) {
      return await this.registerUser(user);
    }

    return this.generateJwt({
      login: userExists.login,
      email: userExists.email,
      avatar: userExists.avatar,
      name: userExists.name,
      banner: userExists.banner,
      intraId: userExists.intraId,
    });
  }
  async registerUser(user: Prisma.UserUncheckedCreateInput) {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          login: user.login,
          email: user.email,
          avatar: user.avatar,
          name: user.name,
          banner: user.banner,
          intraId: user.intraId,
        },
      });
      return await this.generateJwt({
        login: newUser.login,
        email: newUser.email,
        avatar: newUser.avatar,
        name: newUser.name,
        banner: newUser.banner,
        intraId: newUser.intraId,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async generateJwt(payload: any) {
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
