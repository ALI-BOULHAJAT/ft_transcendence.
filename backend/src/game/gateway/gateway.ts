// import { useRef } from "react";
import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import {Player, Ball, ballSpeed} from 'G_Class/class';

var table_obj = {
    player1: new Player(),
    player2: new Player(),
    ball_speed: new ballSpeed(),
    SizeCanvas: ({width:0, height:0}),
    id1: '',
    id2: '',
    ball: new Ball(),
    Status: false,
}
var current: NodeJS.Timeout;

function check_col(){
    if (table_obj.ball.y == 2 || table_obj.ball.y == 98) // colleg with wall
            table_obj.ball_speed.y = -table_obj.ball_speed.y;
    else if (table_obj.ball.x == 95.5 && table_obj.ball.y >= table_obj.player1.position && table_obj.ball.y <= (table_obj.player1.position + 16)) // colleg with player1
            table_obj.ball_speed.x = -table_obj.ball_speed.x;
    else if (table_obj.ball.x == 4.5 && table_obj.ball.y >= table_obj.player2.position && table_obj.ball.y <= (table_obj.player2.position + 16)) // colleg with player2
        table_obj.ball_speed.x = -table_obj.ball_speed.x;
}

function moveBall(){
    if (table_obj.ball.x > 0 && table_obj.ball.x < 100 && table_obj.ball.y > 0 && table_obj.ball.y < 100) {
      table_obj.ball.x += table_obj.ball_speed.x;
      table_obj.ball.y += table_obj.ball_speed.y;
    }
    else {
      table_obj.ball_speed.x = -table_obj.ball_speed.x;
      table_obj.ball_speed.y = -table_obj.ball_speed.y;
      table_obj.ball.x = 50;
    }
  }


@WebSocketGateway()
class MyGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;
    
    onModuleInit() {
        this.server.on('connection', (socket) => {
            socket.on('disconnect', () => {
                if (table_obj.id1 == socket.id) {
                    table_obj.id1 = '';}
                else if (table_obj.id2 == socket.id) {
                    table_obj.id2 = '';
                }
                socket.disconnect();
                console.log('disconnected', socket.id);
            });
            console.log('connected', socket.id);
            if (table_obj.id1 == '') {
                table_obj.id1 = socket.id;
                // console.log('table_obj.id1 :', table_obj.id1);
                this.server.emit('update', table_obj);
            }
            else if (table_obj.id2 == '') {
                table_obj.id2 = socket.id;
                // console.log('table_obj.id2 :', table_obj.id2);
                this.server.emit('update', table_obj);
            }
            else {

                table_obj.id1 = socket.id;
                table_obj.id2 = '';
                this.server.emit('update', table_obj);
            }
            // console.log("id1: ", table_obj.id1, "id2: ", table_obj.id2)
        });
    }
    
    // @SubscribeMessage('moveBall')
    // MoveBall() {
    //     clearInterval(current);
    //     if (table_obj.Status) {
    //         current = setInterval(() => {
    //             check_col();
    //             moveBall();
    //             this.server.emit('setBall', table_obj.ball);
    //         }, 15);
    //     }
    // }
    
    @SubscribeMessage('setPlayer1')
    SetPlayer1(client: any, data: any) {
        table_obj.player1.position = data;
        // this.server.emit('update', table_obj);
        this.server.emit('setPlayer1', data);
        // this.server.to(body.room).emit('message', {titile: 'new message from the server', content: body})
    }

    @SubscribeMessage('getData')
    GetData(client: any, data: any) {
        this.server.emit('getData', table_obj);
    }



    @SubscribeMessage('setPlayer2')
    SetPlayer2(client: any, data: any) {
        table_obj.player2.position = data;
        // this.server.emit('update', table_obj);
        this.server.emit('setPlayer2', data);
    }

    // @SubscribeMessage('setBall')
    // SetBall(client: any, data: any) {
    //     // console.log('data :', data);
    //     // table_obj.ball = data;
    //     // this.server.emit('update', table_obj);
    //     this.server.emit('setBall', table_obj);
    // }
    
    @SubscribeMessage('setStatus')
    SetStatus(client:any, data: boolean) {
        table_obj.Status = data;
        // console.log(data, table_obj);
    }

    @SubscribeMessage('setSize')
    SetSize(client:any, data: any) {
        table_obj.SizeCanvas = data;
    }
}

@WebSocketGateway({namespace: 'ball'})
class BallGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;    
    onModuleInit() {
        this.server.on('connection', (socket) => {
            socket.on('disconnect', () => {
                table_obj.Status = false;
            });
            console.log('ballConnected', socket.id);
        });
    }
        @SubscribeMessage('moveBall')
        MoveBall() {
            // console.log('moveBall', table_obj.Status);
            clearInterval(current);
            if (table_obj.Status) {
                current = setInterval(() => {
                    check_col();
                    moveBall();
                    this.server.emit('setBall', table_obj.ball);
                    if (table_obj.Status == false)
                        clearInterval(current);
                }, 15);
            }
        }
}

export {MyGateway, BallGateway}

