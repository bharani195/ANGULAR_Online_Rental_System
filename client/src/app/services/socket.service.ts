import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  constructor() {
    this.socket = io('http://localhost:5000');
  }

  on<T = any>(eventName: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: T) => observer.next(data));
      return () => this.socket.off(eventName);
    });
  }

  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }
}
