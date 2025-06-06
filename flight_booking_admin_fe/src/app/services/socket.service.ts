import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Connection } from '../types/connection.type';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
// const backendUrl = 'http://3.27.183.125';
const backendUrl = 'http://localhost:8081';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private clientSocket: any;

  constructor(private tokenService: TokenService) {
    this.clientSocket = this.connectSocket();

    this.clientSocket.on('connect', () => {
      console.log('Socket connected:', this.clientSocket.id);
    });

    this.clientSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });
  }

  connectSocket() {
    const socket = io(backendUrl, {
      auth: {
        token: this.tokenService.getAccessToken(),
      },
      transports: ['websocket'],
      // extraHeaders: {
      //   Authorization: `Bearer ${this.tokenService.getAccessToken()}`
      // }
    });

    return socket;
  }

  generateHashID() {
    const chars = '0123456789abcdef';
    let hashID = '';
    for (let i = 0; i < 24; i++) {
      hashID += chars[Math.floor(Math.random() * chars.length)];
    }
    return hashID;
  }

  listenToServer(connection: Connection): Observable<any> {
    return new Observable((observer) => {
      this.clientSocket.on(connection, (data: any) => {
        observer.next(data);
      });
    });
  }

  emitToServer(connection: Connection, data: any): void {
    this.clientSocket.emit(connection, data);
  }
}
