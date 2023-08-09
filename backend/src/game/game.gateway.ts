import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from '@prisma/client';
import { error } from 'console';
import { Server, Socket } from "socket.io";
import { UserService } from "src/users/user.service";
import { v4 as uuidv4 } from 'uuid';
import { Ball, Player, TableMap, UniqueSet, UserMap, random_obj } from '../../tools/class';
import { GameService } from "./game.service";

const UserMap: UserMap = new Map();    ////////// list of user connected to the game
const TableMap: TableMap = new Map();    ////////// list of table obj created
const RandomListTime = new UniqueSet();    ////////// list of random time obj created
const RandomListScore = new UniqueSet();    ////////// list of random score obj created
var currents: NodeJS.Timeout;
var table_obj = {
    player1: new Player(),
    player2: new Player(),
    ball: new Ball(),
    Status: false,
    current: currents,
    tableId: '',
    GameMode: '',
    GameType: '',
    imageLoad: 0,
    time: 0,
    countdown: 45,
    intervaldelay:30
}


export let _User: User | null = null;

function check_col(table: any){
    if (table.ball.y <= 3 || table.ball.y >= 97.5) // colleg with wall
            table.ball.ball_speed.y = -table.ball.ball_speed.y;
    else if (table.ball.x >= 95.3 && table.ball.y > table.player1.position && table.ball.y < (table.player1.position + 16)) // colleg with player1
    {
        var centerPlayer = table.player1.position + 8;
        var ballOffset = table.ball.y - centerPlayer;
        var ballPositionOnPaddle = ballOffset / 16;
        var maxAngle = Math.PI * 0.9;
        var angle = ballPositionOnPaddle * maxAngle;
        table.ball.ball_speed.x = -Math.cos(angle);
        table.ball.ball_speed.y = Math.sin(angle);
        table.ball.ball_speed.x += table.ball.ball_speed.x > 0 ? table.ball.ballIcrement : -table.ball.ballIcrement;
        table.ball.ball_speed.y += table.ball.ball_speed.y > 0 ? table.ball.ballIcrement : -table.ball.ballIcrement;
        // table.ball.ballIcrement += 0.1;
    }
    else if (table.ball.x <= 4.7 && table.ball.y > table.player2.position && table.ball.y < (table.player2.position + 16)) // colleg with player2
    {
        var centerPlayer = table.player2.position + 8;
        var ballOffset = table.ball.y - centerPlayer;
        var ballPositionOnPaddle = ballOffset / 16;
        var maxAngle = Math.PI * 0.9;
        var angle = ballPositionOnPaddle * maxAngle;
        table.ball.ball_speed.x = Math.cos(angle);
        table.ball.ball_speed.y = Math.sin(angle);
        table.ball.ball_speed.x += table.ball.ball_speed.x > 0 ? table.ball.ballIcrement : -table.ball.ballIcrement;
        table.ball.ball_speed.y += table.ball.ball_speed.y > 0 ? table.ball.ballIcrement : -table.ball.ballIcrement;
        // table.ball.ballIcrement += 0.05;
    }

}

function moveBall(server: Server, table: any){
    if (table.ball.x > 0 && table.ball.x < 100 && table.ball.y > 0 && table.ball.y < 100) {
      table.ball.x += table.ball.ball_speed.x;
      table.ball.y += table.ball.ball_speed.y;
    }
    else {
        table.ball.ball_speed.x = -table.ball.ball_speed.x;
        table.ball.ball_speed.y = -table.ball.ball_speed.y;
        if (table.ball.x >= 100) {
            table.player2.score += 1;
            table.ball.x = 50;
            table.intervaldelay = 30;
            server.to(table.tableId + 'ball').emit('setScore2', table.player2.score);
        }
        else {
          table.player1.score += 1;
          table.ball.x = 50;
          table.intervaldelay = 30;
          server.to(table.tableId + 'ball').emit('setScore1', table.player1.score);
        }
      }
    }

@Injectable()
@WebSocketGateway({namespace: 'game'})
class MyGateway implements OnGatewayConnection {
    constructor(private jwtService: JwtService,private readonly usersService: UserService, private GameService: GameService) {}
    
    @WebSocketServer()
    server: Server;
    
    async CreateFriendTable(data: any) {
      return new Promise(async (resolve, reject) => {
        if (!UserMap.has(data.player1_Id))
        {
            const _User = await this.usersService.findOne({ id: data.player1_Id });
            _User && UserMap.set(_User.id, {User: _User, Status: 'offline'});
        }
        if (!UserMap.has(data.player2_Id)) {
          const _User = await this.usersService.findOne({ id: data.player2_Id });
          _User && UserMap.set(_User.id, {User: _User, Status: 'offline'});
        }
        if ((UserMap.get(data.player1_Id) && UserMap.get(data.player1_Id).Status != 'online') || (UserMap.get(data.player2_Id) && UserMap.get(data.player2_Id).Status != 'online')) {
          console.log('user is not online');
        }
        else {
          table_obj.tableId = uuidv4();
          if (UserMap.get(data.player1_Id)
          && UserMap.get(data.player2_Id)
          && UserMap.get(data.player1_Id).SocketId
          && UserMap.get(data.player2_Id).SocketId
          && table_obj.tableId) {
            UserMap.get(data.player1_Id).User = await this.GameService.updateStatus({id:data.player1_Id, status:'InGame'});
            UserMap.get(data.player2_Id).User = await this.GameService.updateStatus({id:data.player2_Id, status:'InGame'});
            UserMap.get(data.player1_Id).Status = 'InGame';
            UserMap.get(data.player2_Id).Status = 'InGame';
            UserMap.get(data.player1_Id).TableId = table_obj.tableId;
            UserMap.get(data.player2_Id).TableId = table_obj.tableId;
            const user1 = UserMap.get(data.player1_Id).User;
            const user2 = UserMap.get(data.player2_Id).User;
            table_obj.GameMode = data.mode;
            table_obj.GameType = 'friend';
            table_obj.player1.setUserId(data.player1_Id);
            table_obj.player2.setUserId(data.player2_Id);
            table_obj.player1.GameSetting.setData(user1.bg_color, user1.ball_color, user1.paddle_color, user1.avatar);
            table_obj.player2.GameSetting.setData(user2.bg_color, user2.ball_color, user2.paddle_color, user2.avatar);
            this.server.to(UserMap.get(data.player1_Id).SocketId).emit('joinRoomGame', table_obj);
            this.server.to(UserMap.get(data.player2_Id).SocketId).emit('joinRoomGame', table_obj);
            TableMap.set(table_obj.tableId, table_obj);
            resolve(table_obj.tableId);
            table_obj = {
              player1: new Player(),
              player2: new Player(),
              ball: new Ball(),
              Status: false,
              current: currents,
              tableId: '',
              GameMode: '',
              GameType: '',
              imageLoad: 0,
              time: 0,
              countdown: 45,
              intervaldelay:30,
            }
          }
          else
            {
              setTimeout(() => {
                this.CreateFriendTable(data).then(resolve).catch(reject);
            }, 1000);
            }
        }
      });
    }
    
    async CreateBotTable(data: any) {
      return new Promise(async (resolve, reject) => {
        if (!UserMap.has(data.player_Id)) {
          const _User = await this.usersService.findOne({ id: data.player_Id });
          _User && UserMap.set(_User.id, {User: _User, Status: 'offline'});
        }
        if (UserMap.get(data.player_Id).Status != 'online') {
          console.log('user is not online ', UserMap.get(data.player_Id).Status);
        }
        else {
          if (UserMap.get(data.player_Id) && UserMap.get(data.player_Id).SocketId && UserMap.get(data.player_Id).BallSocketId) {
            const user = await this.GameService.updateStatus({id:data.player_Id, status:'InGame'});
            UserMap.get(data.player_Id).Status = 'InGame';
            table_obj.tableId = uuidv4();
            UserMap.get(data.player_Id).TableId = table_obj.tableId;
            table_obj.GameMode = data.mode;
            table_obj.GameType = 'Bot';
            table_obj.player1.setUserId(data.player_Id);
            table_obj.player2.setUserId('Bot');
            table_obj.player1.GameSetting.setData(user.bg_color, user.ball_color, user.paddle_color, user.avatar);
            table_obj.player2.GameSetting.setData(user.bg_color, user.ball_color, user.paddle_color, "/avatarBot.png");
            this.server.to(UserMap.get(data.player_Id).SocketId).emit('joinRoomGame', table_obj);
            TableMap.set(table_obj.tableId, table_obj);
            resolve(table_obj.tableId);
  
            table_obj = {
              player1: new Player(),
              player2: new Player(),
              ball: new Ball(),
              Status: false,
              current: currents,
              tableId: '',
              GameMode: '',
              GameType: '',
              imageLoad: 0,
              time: 0,
              countdown: 45,
              intervaldelay:30,
          }
          } else {
            setTimeout(() => {
              this.CreateBotTable(data).then(resolve).catch(reject);
            }, 1000);
          }
        }
      });
    }

    async CreateRandomTable(data: any) {
      return new Promise(async (resolve, reject) => {
        if (!UserMap.has(data.player_Id)) {
          const _User = await this.usersService.findOne({ id: data.player_Id });
          _User && UserMap.set(_User.id, {User: _User, Status: 'offline'});
        }
        if (UserMap.get(data.player_Id) && UserMap.get(data.player_Id).SocketId && UserMap.get(data.player_Id).BallSocketId) {
          const user = await this.GameService.updateStatus({id:data.player_Id, status:'InGame'});
          let obj = new random_obj();
          obj.player.setUserId(data.player_Id);
          obj.player.GameSetting.setData(user.bg_color, user.ball_color, user.paddle_color, user.avatar);
            if (data.mode === 'time')
              RandomListTime.add(obj);
            else
              RandomListScore.add(obj);
            if (RandomListTime.length >= 2 || RandomListScore.length >= 2) {
              table_obj.tableId = uuidv4();
              if (RandomListTime.length >= 2) {
                table_obj.GameMode = 'time';
                table_obj.GameType = 'random';
                table_obj.player1 = RandomListTime.getfirst.player;
                table_obj.player2 = RandomListTime.getfirst.player;
                UserMap.get(data.player1_Id).TableId = table_obj.tableId;
                UserMap.get(data.player2_Id).TableId = table_obj.tableId;
                this.server.to(UserMap.get(table_obj.player1.UserId).SocketId).emit('joinRoomGame', table_obj);
                this.server.to(UserMap.get(table_obj.player2.UserId).SocketId).emit('joinRoomGame', table_obj);
                TableMap.set(table_obj.tableId, table_obj);
                resolve(table_obj);
                table_obj = {
                  player1: new Player(),
                  player2: new Player(),
                  ball: new Ball(),
                  Status: false,
                  current: currents,
                  tableId: '',
                  GameMode: '',
                  GameType: '',
                  imageLoad: 0,
                  time: 0,
                  countdown: 45,
                  intervaldelay:30,
                }
              }
            else {
              table_obj.GameMode = 'score';
              table_obj.player1 = RandomListScore.getfirst.player;
              table_obj.player2 = RandomListScore.getfirst.player;
              UserMap.get(data.player1_Id).TableId = table_obj.tableId;
              UserMap.get(data.player2_Id).TableId = table_obj.tableId;
              this.server.to(UserMap.get(table_obj.player1.UserId).SocketId).emit('joinRoomGame', table_obj);
              this.server.to(UserMap.get(table_obj.player2.UserId).SocketId).emit('joinRoomGame', table_obj);
              TableMap.set(table_obj.tableId, table_obj);
              resolve(table_obj);
              table_obj = {
                player1: new Player(),
                player2: new Player(),
                ball: new Ball(),
                Status: false,
                current: currents,
                tableId: '',
                GameMode: '',
                GameType: '',
                imageLoad: 0,
                time: 0,
                countdown: 45,
                intervaldelay:30,
              }
            }
          }
            }
        else {
          setTimeout(() => {
            this.CreateRandomTable(data).then(resolve).catch(reject);
          }, 1000);
        }
      });
    }

    async LeaveGame(data: any) {
      const table = TableMap.get(data.TableId);
      if (table) {
        await this.GameService.updateStatus({id:table.player1.UserId, status:'online'});
        if (table.player2.UserId !== 'Bot')
          await this.GameService.updateStatus({id:table.player2.UserId, status:'online'});
        TableMap.get(data.TableId).Status = false;
        this.server.to(table.tableId).emit('setStatus',false);
        this.server.to(table.tableId).emit('leaveGame',UserMap.get(data.UserId).SocketId);
      }
    }

    async handleConnection(socket: Socket) {
      const { token } = socket.handshake.auth; // Extract the token from the auth object
      let payload: any = '';
      try {
        if (!token) {
          throw new UnauthorizedException();
        }
        payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        const login: string = payload.login;
        _User = await this.usersService.findOneLogin({ login });
      } catch {
        console.log('+> not valid token', error);
      }
      if (!_User)
        return
      console.log('+-> Client',_User.login , 'connected ', _User.id);
      if (!UserMap.has(_User.id))
        UserMap.set(_User.id, {User: _User, SocketId: socket.id, Status: 'online'});
      else
        UserMap.get(_User.id).SocketId = socket.id;
      if (socket.handshake.auth.tableId) {
        socket.emit('joinRoomGame', TableMap.get(socket.handshake.auth.tableId));
      }
    }
    
    @SubscribeMessage('joinToRoomGame')
    JoinToRoomGame(client: any, data: any) {
      client.join(data);
      this.server.to(data).emit('ready', true);
    }


    @SubscribeMessage('setPlayer1')  //// done
    SetPlayer1(client: any, data: any) {
      if (TableMap.get(data.tableId) && TableMap.get(data.tableId).player1.position != data.Player) {
        TableMap.get(data.tableId).player1.position = data.Player;
        this.server.to(data.tableId).emit('setPlayer1', data.Player);
      }
    }


    @SubscribeMessage('disconnecting')
    async disconneting(client: any, data: any) {
      const UsId = client.handshake.auth.UserId;
      const TableId = UserMap.get(UsId) && UserMap.get(UsId).TableId;
      if (data[0] == "transport close") {
        console.log("the client id: ",UsId," reload the game page");
        if (UserMap.get(UsId) && UserMap.get(UsId).TableId && TableMap.get(UserMap.get(UsId).TableId)) {
          TableMap.get(TableId).Status = false;
          this.server.to(TableId).emit('setStatus', false);
        }
      }
      else {
        console.log("the client id: ",UsId," logout from the game page");
        await this.GameService.updateStatus({id:UsId, status:'online'});
        if (UserMap.get(UsId) && UserMap.get(UsId).TableId && TableMap.get(UserMap.get(UsId).TableId)) {
          this.server.to(TableId).emit('leaveGame');
          clearInterval(TableMap.get(UserMap.get(UsId).TableId).current);
          TableMap.delete(UserMap.get(UsId).TableId);
          UserMap.delete(UsId);
        }
      }
    }

    @SubscribeMessage('deletePlayer')   //// done
    async DeletePlayer(client: any, data: any) {
      if (UserMap.get(client.handshake.auth.UserId)) {
        const tableId = UserMap.get(client.handshake.auth.UserId).TableId;
        if (TableMap.get(tableId) && TableMap.get(tableId).player1 && TableMap.get(tableId).player2) {
          const player1 = TableMap.get(tableId).player1;
          const player2 = TableMap.get(tableId).player2;
          if (UserMap.get(player1.UserId) && UserMap.get(player1.UserId).TableId && TableMap.get(UserMap.get(player1.UserId).TableId)) {
            clearInterval(TableMap.get(UserMap.get(player1.UserId).TableId).current);
            UserMap.get(player1.UserId) && TableMap.delete(UserMap.get(player1.UserId).TableId);
            UserMap.delete(player1.UserId);
            await this.GameService.updateStatus({id:player1.UserId, status:'online'});
          }
          if (UserMap.get(player2.UserId)) {
            UserMap.delete(player2.UserId);
            await this.GameService.CreateScore({Player1:player1.UserId, Player2:player2.UserId, score1:player1.score, score2: player2.score})
            await this.GameService.updateStatus({id:player2.UserId, status:'online'});
          }
        }
      }
    }


    @SubscribeMessage('setPlayer2')   ///// done
    SetPlayer2(client: any, data: any) {
      if (TableMap.get(data.tableId) && TableMap.get(data.tableId).player2.position != data.Player) {
        TableMap.get(data.tableId).player2.position = data.Player;
        this.server.to(data.tableId).emit('setPlayer2', data.Player);
      }
    }

    @SubscribeMessage('setBot')  ///// done
    SetBot(client: any, data: any) {
      if (TableMap.get(data.tableId) && TableMap.get(data.tableId).player2.position != data.Player)
        TableMap.get(data.tableId).player2.position = data.Player;
    }

    
    @SubscribeMessage('setStatus')  ///// done
    SetStatus(client:any, data: any) {
      if (TableMap.get(data.tableId) && TableMap.get(data.tableId).Status != data.status) {
        console.log('setStatus', data);
        const table = TableMap.get(data.tableId);
        table && (table.Status = data.status);
        this.server.to(data.tableId).emit('setStatus', data.status);
      }
    }
    

    @SubscribeMessage('GameOver')  ///// done
    GameOver(client:any, data: any) {
      if (TableMap.get(data.tableId)) {
      let winner = TableMap.get(data.tableId).player1.score > TableMap.get(data.tableId).player2.score ? TableMap.get(data.tableId).player1.UserId : TableMap.get(data.tableId).player2.UserId;
      winner = TableMap.get(data.tableId).player1.score == TableMap.get(data.tableId).player2.score ? 'no one' : winner;
      this.server.to(data.tableId).emit('GameOver', winner);
      }
    }
}
@WebSocketGateway({namespace: 'ball'})
class BallGateway implements OnGatewayConnection {
    constructor(private jwtService: JwtService,private readonly usersService: UserService) {}
    @WebSocketServer()
    server: Server;

    async CreateFriendTable(data: any, id: any) {
      if (UserMap.get(data.player1_Id) && UserMap.get(data.player1_Id).SocketId && UserMap.get(data.player1_Id).BallSocketId && UserMap.get(data.player2_Id) && UserMap.get(data.player2_Id).SocketId && UserMap.get(data.player2_Id).BallSocketId)
      {
        this.server.to(UserMap.get(data.player1_Id).BallSocketId).emit('joinRoomBall', id);
        this.server.to(UserMap.get(data.player2_Id).BallSocketId).emit('joinRoomBall', id);
      }
    }

    async CreateRandomTable(data: any, Tableobj: any) {
      if (UserMap.get(Tableobj.player1.UserId) && UserMap.get(Tableobj.player1.UserId).SocketId && UserMap.get(Tableobj.player1.UserId).BallSocketId
       && UserMap.get(Tableobj.player2.UserId) && UserMap.get(Tableobj.player2.UserId).SocketId && UserMap.get(Tableobj.player2.UserId).BallSocketId)
      {
        this.server.to(UserMap.get(Tableobj.player1.UserId).BallSocketId).emit('joinRoomBall', Tableobj.tableId);
        this.server.to(UserMap.get(Tableobj.player2.UserId).BallSocketId).emit('joinRoomBall', Tableobj.tableId);
      }
    }

    async CreateBotTable(data: any, id: any) {
      if (UserMap.get(data.player_Id) && UserMap.get(data.player_Id).SocketId && UserMap.get(data.player_Id).BallSocketId) {
        this.server.to(UserMap.get(data.player_Id).BallSocketId).emit('joinRoomBall', id);
      }
    }
  
    async handleConnection(socket: Socket) {
        const { token } = socket.handshake.auth; // Extract the token from the auth object
        let payload: any = '';
        try {
          if (!token) {
            throw new UnauthorizedException();
          }
          payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
          });
          const login: string = payload.login;
          _User = await this.usersService.findOneLogin({ login });
        } catch {
          console.log('+> not valid token', error);
        }
        if (!_User)
          return
        console.log('+-> Client',_User.login , 'connected to ball ', _User.id);
        if (!UserMap.has(_User.id))
          UserMap.set(_User.id, {User: _User, BallSocketId: socket.id, Status: 'online'});
        else
          UserMap.get(_User.id).BallSocketId = socket.id;
        if (socket.handshake.auth.tableId) {
          socket.emit('joinRoomBall', socket.handshake.auth.tableId);
        }
    }
    @SubscribeMessage('moveBall')
    MoveBall(client: any, data: any) {
      if (TableMap.get(data)) {
        clearInterval(TableMap.get(data).current);
        if (TableMap.get(data).Status) {
          TableMap.get(data).current = setInterval(() => {
            check_col(TableMap.get(data));
            moveBall(this.server, TableMap.get(data));
                if (TableMap.get(data).Status == false){
                  clearInterval(TableMap.get(data).current);
                }
                // increment the ball speed buy changing the interval delay every 10 seconds
                else if (TableMap.get(data).GameMode == "time" && TableMap.get(data).time % 1000 && TableMap.get(data).time != 0 && TableMap.get(data).intervaldelay > 16) {
                  TableMap.get(data).intervaldelay -= 1;
                  clearInterval(TableMap.get(data).current);
                  this.server.to(data + 'ball').emit('timer', TableMap.get(data).time / 1000);
                  this.MoveBall(client, data);
                }
                else if (TableMap.get(data).GameMode == "time" && TableMap.get(data).time % 1000 && TableMap.get(data).time != 0 && TableMap.get(data).intervaldelay == 16) {
                  TableMap.get(data).intervaldelay += 1;
                  this.server.to(data + 'ball').emit('timer', TableMap.get(data).time / 1000);
                  clearInterval(TableMap.get(data).current);
                  this.MoveBall(client, data);
                }
                TableMap.get(data).time += TableMap.get(data).intervaldelay;
                this.server.to(data + 'ball').emit('setBall', TableMap.get(data).ball);
            }, TableMap.get(data).intervaldelay);
        }
      }
    }
    @SubscribeMessage('joinToRoomBall')
    JoinToRoomBall(client: any, data: any) {
      client.join(data + 'ball');
    }
}

export { BallGateway, MyGateway };

