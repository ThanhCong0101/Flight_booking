import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageService {
  constructor(private http: HttpClient) {}


  searchChatRooms(value: any) :Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/mongo/chat/search-chat-rooms?value=${value}`
    );

  }

  getRoomsByStatus(
    status:
      | 'talk_with_admin_connected'
      | 'talk_with_admin_pending'
      | 'closed'
      | 'talk_with_bot',
    skip: number = 0,
    limit: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/mongo/chat/talk-to-admin-room-by-status?status=${status}&skip=${skip}&limit=${limit}`
    );
  }

  getRoomChatList(skip: number = 0, limit: number = 10): Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/mongo/chat/talk-to-admin-room?skip=${skip}&limit=${limit}`
    );
  }
}
