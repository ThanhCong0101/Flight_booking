import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { local } from 'd3-selection';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  forkJoin,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timestamp,
} from 'rxjs';
import {
  MessageChat,
  MessageList,
  SenderType,
  SlateText,
  typeMessage,
  UserInfoModel,
} from 'src/app/models/mongoDB/message.model';
import { ChatMessageService } from 'src/app/services/mongoDB/chatMessage.service';
import { MessageService } from 'src/app/services/mongoDB/message.service';
import { RoomService } from 'src/app/services/mongoDB/room.service';
import { UserServiceMongoDB } from 'src/app/services/mongoDB/user.service';
import { SocketService } from 'src/app/services/socket.service';
import { Connection } from 'src/app/types/connection.type';
import { convertMessageMongoToClient } from 'src/app/utils/mongoDB/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  roomStatus: { [roomId: string]: 'connected' | 'pending' } = {};

  searchForm!: FormGroup;
  destroy$ = new Subject<void>();

  selectedRoom: string | null = null;
  socket_room_name: string = '';

  selectedRole = 'Admin';

  activeTab: 'connected' | 'pending' = 'connected';
  connectedChats: MessageList[] = [];
  pendingChats: MessageList[] = [];

  selectedAdmin: string = '';

  dummyMessages: MessageChat[] = [];
  userInfo: UserInfoModel = {} as UserInfoModel;
  adminInfo: UserInfoModel = {} as UserInfoModel;
  admin_info: SenderType = {} as SenderType;
  user_info: SenderType = {} as SenderType;

  showConfirmModal = false;

  private assistantID = '6780f3bf9a9aeafb2ad5c778';

  chatForm!: FormGroup;
  isTyping = false;
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor(
    private _fb: FormBuilder,
    private socketService: SocketService,
    private roomService: RoomService,
    private messageService: MessageService,
    private chatService: ChatMessageService,
    private userService: UserServiceMongoDB
  ) {
    this.getAdminData();

    this.socketService
      .listenToServer(Connection.CONNECT_ADMIN)
      .subscribe((dataConnect) => {
        console.log('Received connection request:', dataConnect);
        // Handle the connection request
        if (dataConnect.type === 'adminAssigned') {
          this.roomService
            .getRoomByID(dataConnect.data.room_id)
            .subscribe((data) => {
              console.log('get room ID', data);

              let avatarRoom = '';
              let userInfo = {};
              data.rooms.participants.forEach((participant: any) => {
                if (participant.user_id.type === 'user' || participant.user_id.type === 'guest') {
                  avatarRoom = participant.user_id.profile_picture;

                  const nameUser =
                    participant?.user_id.first_name &&
                    participant?.user_id.last_name
                      ? participant?.user_id.first_name +
                        ' ' +
                        participant?.user_id.last_name
                      : '';

                  const emailUser = participant?.user_id.email;
                  const phoneUser = participant?.user_id.phone;
                  userInfo = {
                    name: nameUser,
                    email: emailUser,
                    phone: phoneUser,
                    avatar: avatarRoom,
                  };

                  this.user_info = {
                    id: participant?.user_id.user_id,
                    name: nameUser,
                    avatar: avatarRoom,
                    isAdmin: false,
                  };
                }
              });

              this.pendingChats.push({
                id: data.rooms._id,
                name: data.rooms.name.split(':')[0],
                lastMessage: data.rooms.last_message.text,
                userInfo: this.userInfo,
                timestamp: data.rooms.created_at,
                avatar: avatarRoom,
                socket_room_name: data.rooms.socket.socket_room_name,
              });
            });
        }
      });

    this.socketService
      .listenToServer(Connection.NEW_MESSAGE)
      .subscribe((data) => {
        console.log('data newMessage', data);
      });

    this.socketService
      .listenToServer(Connection.RECEIVE_SUBSCRIBE_CONVERSATION)
      .subscribe((res) => {
        console.log('RECEIVE_SUBSCRIBE_CONVERSATION', res);

        const pending_room_id = res.data.room_id;

        const roomToMove = this.pendingChats.find(
          (chat) => chat.id === pending_room_id
        );

        if (roomToMove) {
          // Remove from pendingChats
          this.pendingChats = this.pendingChats.filter(
            (chat) => chat.id !== pending_room_id
          );

          // Add to connectedChats
          this.connectedChats = [...this.connectedChats, roomToMove];

          // Update room status
          this.roomStatus[pending_room_id] = 'connected';

          console.log('roomStatus', this.roomStatus);

          this.activeTab = 'connected';
        }
      });

    this.socketService
      .listenToServer(Connection.RECEIVE_MESSAGE)
      .subscribe((data) => {
        console.log('RECEIVE_MESSAGE', data);

        const messageData = [
          {
            type: data.content.type,
            payload: {
              message: data.content.data,
            },
            timestamp: data.created_at,
          },
        ];

        this.pushMessage(messageData, this.user_info, 'user');

        this.connectedChats.forEach((chat) => {
          if (chat.id === this.selectedRoom) {
            chat.lastMessage = data.content.data;
          }})
      });

    this.socketService
      .listenToServer(Connection.DISCONNECT_ADMIN)
      .subscribe((data) => {
        console.log('DISCONNECT_ADMIN', data);
      });

    this.socketService.listenToServer(Connection.END_CHAT).subscribe(() => {});
  }

  getAdminData() {
    const email = localStorage.getItem('userEmail');

    if (email) {
      this.userService.getUserByField({ email: email }).subscribe((res) => {
        console.log('admin', res);
        if (res.user[0].type === 'admin') {
          this.adminInfo = {
            id: res.user[0].user_id,
            name: res.user[0].first_name + ' ' + res.user[0].last_name,
            email: res.user[0].email,
            phone: res.user[0].phone,
            avatar: res.user[0].profile_picture,
          };

          this.admin_info = {
            id: res.user[0]._id,
            name: res.user[0].first_name + ' ' + res.user[0].last_name,
            avatar: res.user[0].profile_picture,
            isAdmin: true,
          };
        }

        console.log('adminInfo', this.adminInfo);
      });
    }
  }

  ngOnInit() {
    this.initForm();
    this.initSearchForm();
    this.loadChats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSearchForm() {
    this.searchForm = this._fb.group({
      searchQuery: ['', Validators.required],
    });
  }

  loadChats() {
    forkJoin({
      connected: this.chatService.getRoomsByStatus('talk_with_admin_connected'),
      pending: this.chatService.getRoomsByStatus('talk_with_admin_pending'),
    }).subscribe(({ connected, pending }) => {
      this.connectedChats = this.mapRoomsToChats(connected.rooms);
      this.pendingChats = this.mapRoomsToChats(pending.rooms);

      console.log('connectedChats', this.connectedChats);
      console.log('pendingChats', this.pendingChats);
    });
  }

  private mapRoomsToChats(rooms: any[]): MessageList[] {
    return rooms.map((room) => {
      // Add status for each room
      this.roomStatus[room._id] =
        room.status === 'talk_with_admin_connected' ? 'connected' : 'pending';

      let avatarRoom = '';
      let nameUser = '';
      let userInfo = {};
      room.participants.forEach((participant: any) => {
        if (participant.user_id.type === 'user' || participant.user_id.type === 'guest') {
          avatarRoom = participant.user_id.profile_picture;

          nameUser =
            participant?.user_id.first_name && participant?.user_id.last_name
              ? participant?.user_id.first_name +
                ' ' +
                participant?.user_id.last_name
              : '';
              userInfo = {
                name: nameUser,
                email: participant?.user_id.email,
                phone: participant?.user_id.phone,
                avatar: avatarRoom,
              };
        }
      });

      return {
        id: room._id,
        name: nameUser ?? room.name.split(':')[0],
        lastMessage: room.last_message.text,
        userInfo: userInfo,
        timestamp: room.created_at,
        avatar: avatarRoom,
        socket_room_name: room.socket.socket_room_name,
      };
    });
  }

  setActiveTab(tab: 'connected' | 'pending') {
    this.activeTab = tab;
  }

  initForm() {
    this.chatForm = this._fb.group({
      message: ['', Validators.required],
    });
  }

  setSelectedRoom(
    room_id: string,
    socket_room_name: string,
    userInfo: UserInfoModel
  ) {
    this.selectedRoom = room_id;
    this.socket_room_name = socket_room_name;

    console.log("userInfo", userInfo)

    this.userInfo = userInfo;

    console.log('socket_room_name', this.socket_room_name);

    this.messageService.getMessagesByRoomID(room_id).subscribe((data) => {
      console.log('data message', data);

      this.dummyMessages = data.messages.map((message: any) => {
        return convertMessageMongoToClient(message);
      });
    });

    this.connectRoom(this.selectedRoom, this.socket_room_name);
  }

  connectRoom(roomID: string, socketRoomName: string) {
    console.log('roomID', roomID);
    console.log('socketRoomName', socketRoomName);

    if (roomID && socketRoomName) {
      this.socketService.emitToServer(Connection.CONNECT_ROOM, {
        socket_room_name: socketRoomName,
      });
    }
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

  sendMessage() {
    console.log('message chat: ', this.chatForm.value.message);

    const messageText = this.chatForm.value.message;
    this.chatForm.reset();

    this.socketService.emitToServer(Connection.NEW_MESSAGE, {
      chat_type: 'text',
      message: messageText,
      room_id: this.selectedRoom,
      socket_room_name: this.socket_room_name,
      user_id: this.adminInfo.id,
      user_type: 'admin',
      is_read: false,
      read_by: [
        {
          user_id: this.adminInfo.id,
        },
        {
          user_id: this.assistantID,
        },
      ],
    });

    const messageData = [
      {
        type: 'text',
        payload: {
          message: messageText,
        },
        timestamp: new Date().getTime(),
      },
    ];

    this.connectedChats.forEach((chat) => {
      if (chat.id === this.selectedRoom) {
        chat.lastMessage = messageText;
      }})

    this.pushMessage(messageData, this.admin_info, 'admin');
  }

  pushMessage(
    dataMessage: any[],
    user_info: SenderType,
    user_type: 'assistant' | 'user' | 'guest' | 'admin'
  ) {
    console.log('push message');
    const isAdmin: boolean = user_type === 'admin';
    dataMessage.forEach((chat: any, index: number) => {
      of(chat)
        .pipe(
          tap(() => {
            if (!isAdmin) {
              this.isTyping = true;
            }
          })
        )
        .subscribe(() => {
          console.log('chat in dataMessage', chat);
          if (chat.type == 'text') {
            if (this.isJSON(chat.payload.message)) {
              let testDataJSON = JSON.parse(chat.payload.message);
              console.log('testDataJSON 1', testDataJSON);
            } else {
              console.log('push text message');
              this.dummyMessages.push({
                type: typeMessage.TEXT,
                sender: user_info,
                payload: {
                  text: chat.payload.message,
                },
                timestamp: chat.timestamp,
              });
            }
          } else if (chat.type == 'choice') {
            console.log('choice');
            this.dummyMessages.push({
              type: typeMessage.CHOICE,
              sender: user_info,
              payload: {
                choice: chat.payload.buttons,
              },
              timestamp: chat.timestamp,
            });
          } else if (chat.type == 'carousel') {
            this.dummyMessages.push({
              type: typeMessage.CAROUSEL,
              sender: user_info,
              payload: {
                layout: 'carousel',
                card: chat.payload.cards,
              },
              timestamp: chat.timestamp,
            });
          } else if (chat.type === 'custom_form') {
            this.handleCustomForm(chat);
          } else if (chat.type === 'cardV2') {
            console.log('chat.payload.cardV2', chat);

            this.dummyMessages.push({
              type: typeMessage.CARDV2,
              sender: user_info,
              payload: {
                card: [chat.payload],
              },
              timestamp: chat.timestamp,
            });

            console.log('cardV2', this.dummyMessages.slice(-1)[0]);
          }

          setTimeout(() => this.scrollToBottom(), 100);
          this.isTyping = false;
        });
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

  handleCustomForm(chat: any) {
    //   console.log('chat', chat);
    //   if (chat.payload.type === 'add_passenger') {
    //     this.dummyMessages.push({
    //       type: 'custom_form',
    //       isAdmin: false,
    //       payload: {
    //         formField: chat.payload.form_structure.passengers[0],
    //       },
    //     });
    //     console.log(
    //       'custom_form message',
    //       this.dummyMessages.slice(-1)[0]
    //     );
    //   }
  }

  handleChoiceSelection(button: any) {}

  private scrollToBottom() {
    try {
      this.scrollContainer()!.nativeElement.scrollTop =
        this.scrollContainer()!.nativeElement.scrollHeight;
    } catch (err) {}
  } 

  disconnectChat(roomId: string, socket_room_name: string) {
    this.socketService.emitToServer(Connection.DISCONNECT_ADMIN, {
      socket_room_name: socket_room_name,
    });

    // Remove from connectedChats
    this.connectedChats = this.connectedChats.filter(
      (chat) => chat.id !== roomId
    );

    this.pendingChats = this.pendingChats.filter((chat) => chat.id !== roomId);
    this.selectedRoom = null;
    delete this.roomStatus[roomId];
  }

  handleAdminSelection(event: any) {
    const selectedValue = event.target.value;
    this.selectedAdmin = selectedValue;

    if (selectedValue === 'chatbot') {
      console.log('chatbot');
      // this.switchToChatbotMode();
    } else {
      console.log('admin', selectedValue);
      this.showConfirmModal = true;
      // this.switchToAdminMode(selectedValue);
    }
  }

  isChatEnabled(): boolean {
    // if (this.activeTab === 'connected') {
    //   return true;
    // } else {
    //   return false;
    // }

    return this.selectedRoom
      ? this.roomStatus[this.selectedRoom] === 'connected'
      : false;
  }

  confirmChat() {
    console.log('selectedRoom', this.selectedRoom);
    console.log('socket_room_name', this.socket_room_name);
    if (this.selectedRoom && this.socket_room_name) {
      this.socketService.emitToServer(Connection.SUBSCRIBE_TO_CONVERSATION, {
        email: localStorage.getItem('userEmail'),
        room_id: this.selectedRoom,
        socket_room_name: this.socket_room_name,
      });

      this.roomStatus[this.selectedRoom] = 'connected';
    }
    this.showConfirmModal = false;
  }

  // Add to your component class
  searchChats() {
    this.searchForm
      .get('searchQuery')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // tap((value) => {
        //   if (value.length < 3) {
        //     this.connectedChats = [];
        //     this.pendingChats = [];
        //   }
        // }),
        // filter((value) => value.length >= 3),
        switchMap((value) => {
          return this.chatService.searchChatRooms(value).pipe(
            catchError((error) => {
              console.error('Error fetching chat rooms:', error);
              return of({ data: [] });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((results) => {
        // Split results into connected and pending chats

        console.log('results', results);
        // this.connectedChats = results.data.filter(
        //   (chat) => chat.status === 'connected'
        // );
        // this.pendingChats = results.data.filter(
        //   (chat) => chat.status === 'pending'
        // );
      });
  }
}
