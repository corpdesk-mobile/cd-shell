/**
 * ide-push-client.service.ts
 * -------------------------------------------------------------
 * Corpdesk CD-Push Subsystem Extension
 * Enables IDE or CLI to push sync events to cd-api,
 * which relays to active runtime apps (PWA shells).
 *
 * The service uses ICdPushEnvelop and ICommConversationSub
 * to maintain consistency with Corpdesk's push architecture.
 * -------------------------------------------------------------
 */

// import { io, Socket } from 'socket.io-client';
// import { v4 as uuidv4 } from 'uuid';
// import CdLog from '../../cd-comm/controllers/cd-logger.controller';
// import { ICdPushEnvelop, ICommConversationSub } from '../../base';

// export class IdePushClientService {
//   private socket: Socket | null = null;
//   private connected = false;
//   private readonly namespace = '/ide-push';

//   constructor(
//     private apiBaseUrl: string,
//     private appId: string = 'test-app-guid'
//   ) {
//     CdLog.info('Initializing IdePushClientService...');
//     this.initialize();
//   }

//   /**
//    * Bootstrap connection + event listeners
//    */
//   private async initialize(): Promise<void> {
//     await this.connect();
//     this.setupListeners();
//   }

//   /**
//    * Establish socket connection to cd-api
//    */
//   private async connect(): Promise<void> {
//     if (this.connected && this.socket) {
//       CdLog.debug('Socket already connected');
//       return;
//     }

//     const endpoint = `${this.apiBaseUrl}${this.namespace}`;
//     CdLog.info(`Attempting to connect to ${endpoint}...`);

//     this.socket = io(endpoint, {
//       transports: ['websocket'],
//       reconnectionAttempts: 3,
//       reconnectionDelay: 1000,
//       auth: {
//         appId: this.appId,
//         clientType: 'IDE',
//       },
//     });

//     this.socket.on('connect', () => {
//       this.connected = true;
//       CdLog.success(`Connected successfully as ${this.socket?.id}`);
//     });

//     this.socket.on('connect_error', (err) => {
//       CdLog.error(`Connection failed: ${err.message}`);
//     });

//     this.socket.on('disconnect', (reason) => {
//       this.connected = false;
//       CdLog.warning(`Disconnected: ${reason}`);
//     });
//   }

//   /**
//    * Register runtime event listeners
//    */
//   private setupListeners(): void {
//     if (!this.socket) {
//       CdLog.error('Cannot setup listeners: socket is null');
//       return;
//     }

//     // Acknowledgment for push events
//     this.socket.on('ide-push-ack', (ack: any) => {
//       CdLog.info('Received ACK from server:', ack);
//     });

//     // Generic notification from cd-api
//     this.socket.on('ide-push-notify', (payload: any) => {
//       CdLog.info('Received IDE push notification:', payload);
//     });

//     // Remote control message (e.g., trigger live reload or sync)
//     this.socket.on('ide-push-command', (cmd: any) => {
//       CdLog.info(`Received command: ${cmd.action}`, cmd);
//       // TODO: Implement live-reload / runtime actions here
//     });

//     CdLog.info('Socket listeners initialized successfully');
//   }

//   /**
//    * Emit test event (simulate file save)
//    */
//   public sendSaveEvent(filePath: string = '/example/path/test.ts'): void {
//     if (!this.socket || !this.connected) {
//       CdLog.error('Socket not connected. Call connect() first.');
//       return;
//     }

//     const guid = uuidv4();
//     const sender: ICommConversationSub = {
//       userId: 0,
//       subTypeId: 1,
//       cdObjId: {
//         appId: this.appId,
//         ngModule: 'IdePushClientService',
//         resourceName: 'IDE',
//         resourceGuid: guid,
//         jwtToken: '',
//         socket: this.socket,
//         socketId: this.socket.id,
//         commTrack: {
//           initTime: Number(new Date()),
//           relayed: false,
//           pushed: false,
//           delivered: false,
//           completed: false,
//           relayTime: 0, 
//           pushTime: 0, 
//           deliveryTime: 0
//         },
//       },
//     };

//     const payload: ICdPushEnvelop = {
//       pushData: {
//         appId: this.appId,
//         pushGuid: guid,
//         triggerEvent: 'ide-save',
//         emittEvent: 'ide-push-save',
//         token: '',
//         pushRecepients: [sender],
//         commTrack: {
//           initTime: Number(new Date()),
//           relayed: false,
//           pushed: false,
//           delivered: false,
//           completed: false,
//           relayTime: 0, 
//           pushTime: 0, 
//           deliveryTime: 0
//         },
//         isNotification: false,
//         isAppInit: false,
//       },
//       req: null,
//       resp: null,
//     };

//     CdLog.info(`Emitting save event for: ${filePath}`);
//     this.socket.emit('ide-push-save', payload, (ack: any) => {
//       CdLog.success('Server acknowledged IDE push', ack);
//     });
//   }

//   /**
//    * Disconnect gracefully
//    */
//   public disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.connected = false;
//       CdLog.info('Disconnected from cd-api');
//     }
//   }
// }

// /**
//  * -------------------------------------------------------------
//  * POC Bootstrap (for testing)
//  * -------------------------------------------------------------
//  */
// (async () => {
//   const apiUrl = 'http://localhost:3000'; // cd-api endpoint
//   const client = new IdePushClientService(apiUrl);

//   // Simulate save event after initialization
//   setTimeout(() => {
//     client.sendSaveEvent('/workspace/src/sample.ts');
//   }, 3000);
// })();

/**
 * ide-push-client.service.ts
 * -------------------------------------------------------------
 * Corpdesk CD-Push Subsystem Extension
 * POC: IDE-to-browser synchronization via cd-push
 * -------------------------------------------------------------
 */

import { io, Socket } from 'socket.io-client';
import chokidar from 'chokidar';
import { v4 as uuidv4 } from 'uuid';
import CdLog from '../../cd-comm/controllers/cd-logger.controller';
import { ICdPushEnvelop, ICommConversationSub } from '../../base';

// IMPORTANT: Update this URL to your existing Socket.IO server address
const SOCKET_SERVER_URL = 'http://localhost:3000'; 
const SOURCE_DIR = './src';

const socket = io(SOCKET_SERVER_URL);
let watcher = chokidar.watch(SOURCE_DIR, { 
    ignored: /(node_modules|dist|temp)/, // Ignore common folders
    persistent: true 
});

export class IdePushClientService {
  private socket: Socket | null = null;
  private connected = false;
  private readonly namespace = '/';
  

  constructor(
    private apiBaseUrl: string,
    private workspacePath: string,
    private appId: string = 'test-app-guid'
  ) {
    CdLog.info('Initializing IdePushClientService...');
    this.initialize();
  }

  /**
   * Bootstrap connection + event listeners + watcher
   */
  private async initialize(): Promise<void> {
    await this.connect();
    this.setupListeners();
    this.initializeFileWatcher();
  }

  /**
   * Establish socket connection to cd-api
   */
  private async connect(): Promise<void> {
    if (this.connected && this.socket) {
      CdLog.debug('Socket already connected');
      return;
    }

    const endpoint = `${this.apiBaseUrl}${this.namespace}`;
    CdLog.info(`Attempting to connect to ${endpoint}...`);

    this.socket = io(endpoint, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      auth: {
        appId: this.appId,
        clientType: 'IDE',
      },
    });

    this.socket.on('connect', () => {
      this.connected = true;
      CdLog.success(`Connected successfully as ${this.socket?.id}`);
    });

    this.socket.on('connect_error', (err) => {
      CdLog.error(`Connection failed: ${err.message}`);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      CdLog.warning(`Disconnected: ${reason}`);
    });
  }

  /**
   * Register runtime event listeners
   */
  private setupListeners(): void {
    if (!this.socket) {
      CdLog.error('Cannot setup listeners: socket is null');
      return;
    }

    this.socket.on('ide-push-ack', (ack: any) => {
      CdLog.info('Received ACK from server:', ack);
    });

    this.socket.on('ide-push-notify', (payload: any) => {
      CdLog.info('Received IDE push notification:', payload);
    });

    this.socket.on('ide-push-command', (cmd: any) => {
      CdLog.info(`Received command: ${cmd.action}`, cmd);
      // TODO: Implement live-reload or remote actions here
    });

    CdLog.info('Socket listeners initialized successfully');
  }

  /**
   * Initialize file watcher for save events
   */
  private initializeFileWatcher(): void {
    if (!this.workspacePath) {
      CdLog.error('Workspace path not provided for file watcher');
      return;
    }

    CdLog.info(`Watching workspace for changes: ${this.workspacePath}`);

    watcher = chokidar.watch(this.workspacePath, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true,
    });

    watcher .on('change', (filePath) => {
      CdLog.info(`Detected file change: ${filePath}`);
      this.sendSaveEvent(filePath);
    });

    watcher .on('error', (error) => {
      CdLog.error(`Watcher error: ${error}`);
    });
  }

  /**
   * Emit save event (to cd-api → cd-shell)
   */
  public sendSaveEvent(filePath: string): void {
    if (!this.socket || !this.connected) {
      CdLog.error('Socket not connected. Call connect() first.');
      return;
    }

    const guid = uuidv4();
    const sender: ICommConversationSub = {
      userId: 0,
      subTypeId: 1,
      cdObjId: {
        appId: this.appId,
        ngModule: 'IdePushClientService',
        resourceName: 'IDE',
        resourceGuid: guid,
        jwtToken: '',
        socket: this.socket,
        socketId: this.socket.id,
        commTrack: {
          initTime: Number(new Date()),
          relayed: false,
          pushed: false,
          delivered: false,
          completed: false,
          relayTime: 0, 
          pushTime: 0, 
          deliveryTime: 0
        },
      },
    };

    const payload: ICdPushEnvelop = {
      pushData: {
        appId: this.appId,
        pushGuid: guid,
        triggerEvent: 'ide-save',
        emittEvent: 'ide-push-save',
        token: '',
        pushRecepients: [sender],
        commTrack: {
          initTime: Number(new Date()),
          relayed: false,
          pushed: false,
          delivered: false,
          completed: false,
          relayTime: 0, 
          pushTime: 0, 
          deliveryTime: 0
        },
        isNotification: false,
        isAppInit: false,
      },
      req: null,
      resp: null,
    };

    CdLog.info(`Emitting save event for file: ${filePath}`);
    this.socket.emit('ide-push-save', payload, (ack: any) => {
      CdLog.success('Server acknowledged IDE push', ack);
    });
  }

  /**
   * Disconnect gracefully
   */
  public disconnect(): void {
    if (watcher ) {
      watcher .close();
      CdLog.info('File watcher stopped');
    }
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      CdLog.info('Disconnected from cd-api');
    }
  }
}

/**
 * -------------------------------------------------------------
 * Bootstrap (POC demo)
 * -------------------------------------------------------------
 */
(async () => {
  const apiUrl = 'http://localhost:3000'; // cd-api endpoint
  const workspaceDir = '/path/to/your/project/src'; // 👈 Replace with actual workspace path

  const client = new IdePushClientService(apiUrl, workspaceDir);

  // Optional: test manual save trigger
  setTimeout(() => {
    client.sendSaveEvent('/workspace/sample.ts');
  }, 5000);
})();

