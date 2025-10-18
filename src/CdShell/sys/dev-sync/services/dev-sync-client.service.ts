// import { io } from "socket.io-client";
// import config from "../../../../config";
// import { CdStoreFactoryService } from "../../cd-store/services/cd-store-factory.service";
// import { BaseService, ICdPushEnvelop } from "../../base";
// import { IdePushClientService } from "../../cd-push/services/ide-push-client.service";
// import { SioClientService } from "../../cd-push/services/sio-client.service";

// export class DevSyncClientService {
//   store;
//   socket;
//   appId: string;
//   config;

//   constructor() {
//     this.config = config.devSync;
//     const store = CdStoreFactoryService.create(config.devSync.storageType);
//     if (config.devSync.autoInitialize) {
//       this.initialize();
//     }
//   }
//   /**
//    * Entry point for starting dev-sync client.
//    */
//   async initialize(): Promise<void> {
//     await this.connect();
//     await this.setAppId();
//     await this.registerClient();
//     this.listenForEvents();
//   }

//   /**
//    * Connects socket to DevSync server.
//    */
//   private async connect(): Promise<void> {
//     this.socket = io(this.config.sioEndpoint, {
//       transports: ['websocket'],
//     });

//     this.socket.on('connect', () => {
//       console.log(`[DevSync] Connected with socket ID: ${this.socket.id}`);
//     });

//     this.socket.on('disconnect', () => {
//       console.log('[DevSync] Disconnected from server');
//     });
//   }

//   /**
//    * Sets application identity (unique app ID) for the session.
//    */
//   private async setAppId(): Promise<void> {
//     const existing = await this.store.get('devsync.appId');
//     if (existing) {
//       this.appId = existing;
//       console.log(`[DevSync] Using existing appId: ${this.appId}`);
//       return;
//     }

//     // Create a new one if none exists
//     this.appId = this.generateGuid();
//     await this.store.save('devsync.appId', this.appId);
//     console.log(`[DevSync] Generated new appId: ${this.appId}`);
//   }

//   /**
//    * Register this client with cd-sio (like “login” into the DevSync session).
//    */
//   private async registerClient(): Promise<void> {
//     const senderData = {
//       appId: this.appId,
//       socketId: this.socket.id,
//       connectedAt: new Date().toISOString(),
//     };

//     await this.store.save('devsync.sender', senderData);
//     this.socket.emit('register-client', JSON.stringify(senderData));
//     console.log(`[DevSync] Client registered with server`);
//   }

//   /**
//    * Start listening for registered server events.
//    */
//   private listenForEvents(): void {
//     const registeredEvents = [
//       'push-registered-client',
//       'push-msg-relayed',
//       'push-msg-pushed',
//       'push-delivered',
//       'push-msg-completed',
//       'push-notif',
//     ];

//     registeredEvents.forEach(event => {
//       this.socket.on(event, (payload: any) => {
//         console.log(`[DevSync] Event received: ${event}`, payload);
//         this.handleIncoming(payload);
//       });
//     });
//   }

//   /**
//    * Process inbound message (push payloads, updates, etc.)
//    */
//   private async handleIncoming(payload: any): Promise<void> {
//     if (payload?.appId && payload.appId === this.appId) {
//       console.log('[DevSync] Ignoring self-update to prevent loop.');
//       return;
//     }

//     console.log('[DevSync] Applying payload update:', payload);
//     // TODO: apply file/memory sync logic here
//   }

//   /**
//    * Emit update message to server.
//    */
//   async pushUpdate(data: any): Promise<void> {
//     const payload = {
//       sender: this.appId,
//       timestamp: Date.now(),
//       data,
//     };

//     this.socket.emit('send-pub', JSON.stringify(payload));
//     console.log(`[DevSync] Update sent to server`);
//   }

//   private generateGuid(): string {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
//       const r = Math.random() * 16 | 0,
//         v = c === 'x' ? r : (r & 0x3 | 0x8);
//       return v.toString(16);
//     });
//   }
// }

import { io } from "socket.io-client";
import config from "../../../../config";
import { CdStoreFactoryService } from "../../cd-store/services/cd-store-factory.service";
import { BaseService, ICdPushEnvelop } from "../../base";
import { IdePushClientService } from "../../cd-push/services/ide-push-client.service";
import { SioClientService } from "../../cd-push/services/sio-client.service";

export class DevSyncClientService {
  b = new BaseService<any>();
  svSioClient = new SioClientService();
  svIdePushClient = new IdePushClientService()
  store;
  socket;
  appId: string;
  config;

  constructor() {
    console.debug("[DevSyncClientService] 1");
    this.config = config.devSync;
    this.store = CdStoreFactoryService.createEnvironmentAwareStore(this.config.storageType);

    if (this.config.autoInitialize) {
      this.initialize();
    }
  }

  async initialize(): Promise<void> {
    await this.connect();
    await this.setAppId();
    await this.registerClient();
    this.listenForEvents();
  }

  async connect(): Promise<void> {
    this.socket = io(this.config.sioEndpoint, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log(`[DevSync] Connected (socket ID: ${this.socket.id})`);
    });
    this.socket.on('disconnect', () => {
      console.log('[DevSync] Disconnected');
    });
  }

  async setAppId(): Promise<void> {
    const existing = await this.store.get('devsync.appId');
    if (existing) {
      this.appId = existing;
      console.log(`[DevSync] Using existing appId: ${this.appId}`);
      return;
    }
    // this.appId = this.b.getGuid();
    this.appId = 'xxx-ddd';
    await this.store.save('devsync.appId', this.appId);
    console.log(`[DevSync] Generated new appId: ${this.appId}`);
  }

  async registerClient(): Promise<void> {
    const senderData = {
      appId: this.appId,
      socketId: this.socket.id,
      connectedAt: new Date().toISOString(),
    };
    await this.store.save('devsync.sender', senderData);
    this.socket.emit('register-client', JSON.stringify(senderData));
  }

  private listenForEvents(): void {
    const events = [
      'push-registered-client',
      'push-msg-relayed',
      'push-msg-pushed',
      'push-delivered',
      'push-msg-completed',
      'push-notif',
    ];

    events.forEach(event => {
      this.socket.on(event, (payload: any) => {
        this.handleIncoming(event, payload);
      });
    });
  }

  private async handleIncoming(event: string, payload: any): Promise<void> {
    if (payload?.appId && payload.appId === this.appId) {
      console.log(`[DevSync] Ignoring self (${event})`);
      return;
    }
    console.log(`[DevSync] Event ${event} received`, payload);
    // Apply relevant logic here
  }

  sendSioMessage(envl: ICdPushEnvelop): void {
    // this.logger.info('cd-user/LoginComponent::sendSioMessage/envl:', envl);
    this.svSioClient.sendMessageV2(envl.pushData.triggerEvent, envl).subscribe({
      next: (response: boolean) => {
        console.log('Message sent successfully:', response);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
      complete: () => {
        console.log('Message sending complete');
      }
    });
  }

  async pushUpdate(data: any): Promise<void> {
    const payload = {
      sender: this.appId,
      timestamp: Date.now(),
      data,
    };
    this.socket.emit('send-pub', JSON.stringify(payload));
    console.log(`[DevSync] Update sent`);
  }

  // private generateGuid(): string {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  //     const r = Math.random() * 16 | 0;
  //     const v = c === 'x' ? r : (r & 0x3 | 0x8);
  //     return v.toString(16);
  //   });
  // }
}
