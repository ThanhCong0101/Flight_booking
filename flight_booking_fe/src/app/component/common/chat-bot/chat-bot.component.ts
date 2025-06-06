import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  viewChild,
  ElementRef,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { delay, of, tap } from 'rxjs';
import {
  MessageChat,
  ChatResponse,
  Choice,
  SlateText,
  FormField,
  Button,
  Card,
} from 'src/app/models/chatbot.model';
import { ChatBotService } from 'src/app/services/chat-bot.service';
import { DynamicFormComponent } from '../../util/dynamic-form/dynamic-form.component';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';
import { Connection } from 'src/app/types/connection.type';
import { RoomService } from 'src/app/services/mongoDB/room.service';
import { UserServiceMongoDB } from 'src/app/services/mongoDB/user.service';
import { UserMongoDBModel } from 'src/app/models/mongoDB/user.model';
import { MessageService } from 'src/app/services/mongoDB/message.service';
import { convertMessageMongoToClient } from 'src/app/util/message';
declare global {
  interface Window {
    voiceflow: {
      chat: {
        load: (config: any) => void;
      };
    };
  }
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
})
export class ChatBotComponent {
  chatContainer = viewChild<ElementRef>('chatContainer');
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  messages: Array<MessageChat> = [];
  chatForm!: FormGroup;

  isTyping = false;

  isMinimized = false;
  showEndChat = false;

  desCarousel: string = '';

  formFields = signal<{ [key: string]: FormField }>(
    {} as { [key: string]: FormField }
  );

  private assistantID = '6780f3bf9a9aeafb2ad5c778';

  private room_id: string = '';
  private socket_room_name: string = '';
  private user_id: string = '';
  private userType: 'guest' | 'admin' | 'user' | 'assistant' = 'guest';

  constructor(
    private _fb: FormBuilder,
    private chatBotService: ChatBotService,
    private router: Router,
    private socketService: SocketService,
    private roomService: RoomService,
    private userService: UserServiceMongoDB,
    private messageService: MessageService
  ) {
    this.initForm();

    this.socketService
      .listenToServer(Connection.SUBSCRIBE_TO_CONVERSATION)
      .subscribe((data) => {});

    this.socketService
      .listenToServer(Connection.NEW_MESSAGE)
      .subscribe((data) => {
        console.log('NEW_MESSAGE', data);
      });

    this.socketService
      .listenToServer(Connection.RECEIVE_SUBCRIBE_CONVERSATION)
      .subscribe((data) => {
        console.log('RECEIVE_SUBCRIBE_CONVERSATION', data);

        const informMessage = [
          {
            type: 'text',
            payload: {
              message: 'Assign to admin successfully',
            },
          },
        ];

        this.pushMessage(informMessage, 'assistant');
      });

    // Handle disconnection
    this.socketService
      .listenToServer(Connection.DISCONNECT_ADMIN)
      .subscribe(() => {
        this.setIsTalkingWithAD(false);

        console.log('Admin disconnected');

        // Inform user about switching back to bot
        const informMessage = [
          {
            type: 'text',
            payload: {
              message:
                'You are now chatting with our AI assistant. How can I help you?',
            },
          },
        ];

        this.pushMessage(informMessage, 'assistant');
      });

    this.socketService
      .listenToServer(Connection.RECEIVE_MESSAGE)
      .subscribe((data) => {
        console.log('RECEIVE_MESSAGE', data);

        this.messages.push(convertMessageMongoToClient(data));
      });
  }

  ngOnInit(): void {
    const socket = this.socketService.getSocket();

    socket.on('connect', () => {
      this.initRoom();
    });
  }

  initRoom() {
    const email = localStorage.getItem('userEmail');
    const roomID = localStorage.getItem('roomID');
    const socketRoomName = localStorage.getItem('socket_room_name');

    console.log('roomID', roomID);

    if (roomID && socketRoomName) {
      this.socketService.emitToServer(Connection.CONNECT_ROOM, {
        socket_room_name: socketRoomName,
      });

      this.messages = [];

      this.roomService.getRoomByID(roomID).subscribe((data) => {
        console.log('data', data);
        data.rooms.participants.forEach((participant: any) => {
          if (participant.user_id !== this.assistantID) {
            this.setUserID(participant.user_id);
          }
        });

        this.setRoomID(data.rooms._id);
      });

      this.messageService
        .getMessagesByRoomID(roomID)
        .subscribe((messageData) => {
          console.log('new message when roomID exist', messageData);

          this.messages = messageData.messages.map((message: any) => {
            console.log('message', message);
            return convertMessageMongoToClient(message);
          });
        });
    } else {
      console.log('email', email);
      if (!email) {
        this.setUserID(this.socketService.generateHashID());

        const userData: UserMongoDBModel = {
          user_id: this.getUserID(),
          type: 'guest',
          is_temporary: true,
        };

        this.userService.createUser(userData).subscribe((user) => {
          console.log('guest created', user);
          this.setUserType('guest');
          this.createChatRoom(email);
        });
      } else {
        this.userService.getUserByField({ email }).subscribe((data) => {
          if (data.user.length) {
            this.setUserType('user');
            this.setUserID(data.user[0].user_id);

            console.log('user', this.getUserID());
            this.createChatRoom(email);
          } else {
            console.log("This User doesn't exist! ");
          }
        });
      }

      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  // Helper method to create chat room
  private createChatRoom(email: string | null) {
    console.log(
      'function createChatRoom',
      (email ? 'User:' : 'Guest:') + (email ? email : this.getUserID())
    );

    this.setSocketRoomName(
      (email ? 'User:' : 'Guest:') + (email ? email : this.getUserID())
    );
    this.roomService
      .createRoom({
        status: 'talk_with_bot',
        name: this.getSocketRoomName(),
        participants: [
          {
            user_id: this.assistantID,
          },
        ],
        socket: {
          socket_room_name: this.socket_room_name,
        },
      })
      .subscribe((data) => {
        this.setRoomID(data.room._id);
        console.log('room', data.room._id);
        localStorage.setItem('roomID', this.getRoomID());
        this.initChat();

        console.log('room_id', this.getRoomID());
        console.log('user_id', this.getUserID());
        console.log('socket_room_name', this.getSocketRoomName());

        this.socketService.emitToServer(Connection.JOIN_ROOM, {
          socket_room_name: this.getSocketRoomName(),
          room_id: this.getRoomID(),
          email: email,
        });

        localStorage.setItem('socket_room_name', this.getSocketRoomName());
      });
  }

  setUserID(userID: string) {
    this.user_id = userID;
  }

  getUserID() {
    return this.user_id;
  }

  setRoomID(roomID: string) {
    this.room_id = roomID;
  }

  getRoomID() {
    return this.room_id;
  }

  setIsTalkingWithAD(isTalkWithAD: boolean) {
    localStorage.setItem('IsTalkingWithAD', isTalkWithAD.toString());
  }

  getIsTalkingWithAD() {
    return localStorage.getItem('IsTalkingWithAD') === 'true';
  }

  setSocketRoomName(socketRoomName: string) {
    this.socket_room_name = socketRoomName;
  }

  getSocketRoomName() {
    return this.socket_room_name;
  }

  setUserType(type: 'guest' | 'admin' | 'user' | 'assistant') {
    this.userType = type;
  }

  getUserType() {
    return this.userType;
  }

  onChange(change: any) {
    console.log('change', change);
  }

  initForm() {
    this.chatForm = this._fb.group({
      message: ['', Validators.required],
    });
  }

  initChat() {
    this.chatBotService.loadChat().subscribe((response: ChatResponse[]) => {
      console.log('load chat ', response);
      this.isTyping = true;

      this.pushMessage(response, 'assistant');
    });
  }

  isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (this.chatBotService.getUserID() === '') {
      this.initRoom();
    }
  }

  showEndChatPopup() {
    this.showEndChat = true;
  }

  private scrollToBottom() {
    try {
      this.scrollContainer()!.nativeElement.scrollTop =
        this.scrollContainer()!.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    if (this.chatForm.valid) {
      // Add user message to chat

      const userMesage = [
        {
          type: 'text',
          payload: {
            message: this.chatForm.value.message!,
          },
        },
      ];

      this.pushMessage(userMesage, this.getUserType());

      setTimeout(() => this.scrollToBottom(), 100);

      // Clear input
      this.chatForm.reset();

      console.log('isTalkWithAD', this.getIsTalkingWithAD());

      if (this.getIsTalkingWithAD()) {
        this.socketService.emitToServer(Connection.NEW_MESSAGE, {
          chat_type: 'text',
          message:
            this.messages.slice(-1)[0].payload![
              this.messages.slice(-1)[0].type as keyof MessageChat['payload']
            ],
          room_id: this.getRoomID(),
          user_id: this.getUserID(),
          user_type: this.getUserType(),
          is_read: false,
          read_by: [{ user_id: this.getUserID() }],
        });
      } else {
        this.chatBotService
          .interact({
            type: 'text',
            payload: userMesage[0].payload.message,
          })
          .subscribe((response: ChatResponse[]) => {
            console.log(response);
            this.isTyping = true;

            // Push message to chat
            this.pushMessage(response, 'assistant');
          });
      }
    }
  }

  handleTalkToAdminDone() {
    const request = {
      type: 'continue',
    };

    this.chatBotService.interact(request).subscribe((response) => {
      console.log('Okay ', response);
      this.isTyping = true;

      // this.pushMessage(response, 'assistant');
    });
  }

  handleChoiceSelection(choice: Choice) {
    const choiceMessage = [
      {
        type: 'text',
        payload: {
          message: choice.name,
        },
      },
    ];

    this.pushMessage(choiceMessage, this.getUserType());

    console.log('choice', choice);

    if (choice.request['payload']?.actions) {
      choice.request['payload']?.actions.forEach((action: any) => {
        if (action.type === 'open_url') {
          window.open(action.payload.url, '_blank');
          return;
        }
        if (action.type === 'navigate_url') {
          if (action.payload.url.startsWith('http://localhost:4200')) {
            // For internal navigation, extract the path and query params
            const url = new URL(action.payload.url);
            this.router.navigateByUrl(url.pathname + url.search);
          } else {
            // For external URLs, open in new tab
            window.open(action.payload.url, '_blank');
          }
          return;
        }
      });
    } else {
      // Send choice payload to service
      this.chatBotService.interact(choice.request).subscribe((response) => {
        console.log('response choice selection', response);
        this.isTyping = true;

        this.pushMessage(response, 'assistant');
      });
    }

    setTimeout(() => this.scrollToBottom(), 100);
  }

  handleSelectionCarousel(button: Button) {
    const carouselMessage = [
      {
        type: 'text',
        payload: {
          message: button.name,
        },
      },
    ];

    this.pushMessage(carouselMessage, this.getUserType());

    setTimeout(() => this.scrollToBottom(), 100);

    // Send choice payload to service
    this.chatBotService.interact(button.request).subscribe((response) => {
      console.log('response carousel selection', response);
      this.isTyping = true;

      this.pushMessage(response, 'assistant');
    });
  }

  handleCardSelection(card: Card){

  }

  endChat() {
    this.chatBotService.deleteState().subscribe(() => {
      this.messages = [];
      this.isMinimized = false;
      this.chatForm.reset();
      this.showEndChat = false;

      this.socketService.emitToServer(Connection.END_CHAT, {
        socket_room_name: this.socket_room_name,
        room_id: this.getRoomID(),
        reason: 'user_left',
      });

      localStorage.removeItem('roomID');
      localStorage.removeItem('socket_room_name');
    });
  }

  renderStyledText = (children: SlateText[]): string => {
    return children
      .map((child) => {
        let style = '';
        if (child.fontWeight === '700') {
          style += 'font-bold ';
        }
        if (child.color) {
          style += `color: rgb(${child.color.r},${child.color.g},${child.color.b}) `;
        }
        if (child.underline) {
          style += 'text-decoration-line: underline ';
        }
        return `<span class="${style.trim()}">${child.text}</span>`;
      })
      .join('');
  };

  pushMessage(
    dataMessage: any[],
    user_type: 'assistant' | 'user' | 'guest' | 'admin'
  ) {
    const isUser: boolean = user_type === 'user' || user_type === 'guest';
    dataMessage.forEach((chat: any, index: number) => {
      of(chat)
        .pipe(
          tap(() => {
            if (!isUser) {
              this.isTyping = true;
            }
          }),
          delay((chat.payload?.delay || 500) * (index + 1) || 2000)
        )
        .subscribe(() => {
          if (chat.type == 'text') {
            if (this.isJSON(chat.payload.message)) {
              let testDataJSON = JSON.parse(chat.payload.message);
              console.log('testDataJSON 1', testDataJSON);
            } else {
              this.messages.push({
                type: 'text',
                isUser: isUser,
                payload: {
                  text: chat.payload.message,
                },
              });
            }
          } else if (chat.type == 'choice') {
            console.log('choice');
            this.messages.push({
              type: 'choice',
              isUser: isUser,
              payload: {
                choice: chat.payload.buttons,
              },
            });
          } else if (chat.type == 'carousel') {
            this.messages.push({
              type: 'carousel',
              isUser: isUser,
              payload: {
                layout: 'carousel',
                carousel: chat.payload.cards,
              },
            });
          } else if (chat.type === 'custom_form') {
            this.handleCustomForm(chat);
          } else if (chat.type === 'cardV2') {
            console.log('chat.payload.cardV2', chat);

            this.messages.push({
              type: 'cardV2',
              isUser: isUser,
              payload: {
                cardV2: [chat.payload],
              },
            });

            console.log('cardV2', this.messages[this.messages.length - 1]);
          } else if (chat.type === 'talk_to_admin') {
            this.socketService.emitToServer(Connection.CONNECT_ADMIN, {
              user_id: this.getUserID(),
              room_id: this.getRoomID(),
            });

            const informMessage = [
              {
                type: 'text',
                payload: {
                  message: 'You will be connected to an agent shortly.',
                },
              },
            ];

            this.pushMessage(informMessage, 'assistant');

            this.setIsTalkingWithAD(true);
          }

          const allowedTypes = [
            'text',
            'voice',
            'image',
            'carousel',
            'cardV2',
            'choice',
            'formField',
          ];
          if (allowedTypes.includes(chat.type)) {
            let messageFormated = '';

            if (this.messages.slice(-1)[0].type === 'text') {
              messageFormated = this.messages.slice(-1)[0].payload?.text || '';
            } else {
              messageFormated = JSON.stringify(
                this.messages.slice(-1)[0].payload![
                  this.messages.slice(-1)[0]
                    .type as keyof MessageChat['payload']
                ]
              );
            }
            // Get the last message
            this.socketService.emitToServer(Connection.NEW_MESSAGE, {
              chat_type: chat.type,
              message: messageFormated,
              room_id: this.getRoomID(),
              user_id: this.getUserID(),
              socket_room_name: this.socket_room_name,
              user_type: user_type,
              is_read: false,
              read_by: [{ user_id: this.getUserID() }],
            });
          }

          setTimeout(() => this.scrollToBottom(), 100);
          this.isTyping = false;
        });
    });
  }

  onFormSubmit(form: any) {
    console.log('form', form);

    this.chatBotService
      .interact({
        type: 'complete',
        payload: JSON.stringify(form),
      })
      .subscribe((response) => {
        console.log('response', response);
        this.isTyping = true;
      });
  }

  handleCustomForm(chat: any) {
    console.log('chat', chat);

    if (chat.payload.type === 'add_passenger') {
      this.messages.push({
        type: 'custom_form',
        isUser: false,
        payload: {
          formField: chat.payload.form_structure.passengers[0],
        },
      });

      console.log(
        'custom_form message',
        this.messages[this.messages.length - 1]
      );
    }
  }
}
