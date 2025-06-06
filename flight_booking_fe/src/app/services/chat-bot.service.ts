import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatBotService {
  private apiUrl = 'https://general-runtime.voiceflow.com/state/user';
  private authorization_chat_bot =
    'VF.DM.6768f10323f513b896bec8ed.BRNJsDc8D1YsdpX8';

  constructor(private http: HttpClient) {}

  private generateUserID() {
    // create code that generate random user_id
    const userID =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    localStorage.setItem('vf_user_id', userID);
  }

  getUserID() {
    return localStorage.getItem('vf_user_id');
  }

  loadChat(
    config: any = {
      tts: false,
      stripSSML: true,
      stopAll: false,
      // excludeTypes: ['block', 'debug', 'flow']
    }
  ) {
    this.generateUserID();

    return this.http.post<any>(
      `${this.apiUrl}/${this.getUserID()}/interact?logs=off`,
      {
        action: {
          type: 'launch',
        },
        config: config,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authorization_chat_bot,
          versionID: 'production',
        },
      }
    );
  }

  interact(
    action: any,
    config: any = {
      tts: false,
      stripSSML: true,
      stopAll: false,
      // excludeTypes: ['block', 'debug', 'flow']
    }
  ) {
    return this.http.post<any>(
      `${this.apiUrl}/${this.getUserID()}/interact?logs=off`,
      {
        action: action,
        config: {
          tts: false,
          stripSSML: true,
          stopAll: false,
          excludeTypes: ['block', 'debug', 'flow'],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authorization_chat_bot,
          versionID: 'production',
        },
      }
    );
  }

  deleteState() {
    return this.http
      .delete<any>(`${this.apiUrl}/${this.getUserID()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authorization_chat_bot,
          versionID: 'production',
        },
      })
      .pipe(
        tap(() => {
          // Remove userID after successful deletion
          localStorage.removeItem('vf_user_id');
        })
      );
  }
}
