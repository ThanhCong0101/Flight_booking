import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private http: HttpClient) {}

  getRoomByID(room_id: string) : Observable<any> {
    return this.http.get<any>(`${APIUrl}/mongo/room/${room_id}`)
  }

  createRoom(roomData: any): Observable<any> {
    return this.http.post<any>(`${APIUrl}/mongo/room/create`, roomData)
  }


}
