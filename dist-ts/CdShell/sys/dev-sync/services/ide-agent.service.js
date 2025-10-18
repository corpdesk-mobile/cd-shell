// import config from "../../../../config";
import path from "path";
import fs from "fs";
import config from "../../../../config";
import { SioClientService } from "../../cd-push/services/sio-client.service";
import { BaseService, } from "../../base";
import { CdStoreService } from "../../cd-store/services/cd-store.service";
export class IdeAgentService {
    constructor() {
        this.b = new BaseService();
        this.jwtWsToken = "";
        this.svSio = new SioClientService();
        this.svCdStore = new CdStoreService();
        this.socketData = [];
        this.initialize();
    }
    ///////////////////////////////////////////////////////////
    // corpdesk-rfc-0004 protocol methods
    ///////////////////////////////////////////////////////////
    async initialize() {
        this.setAppId();
        this.initSioClient();
        this.startSaveWatcher();
    }
    setAppId() {
        console.log("dev-sync::IdeAgentService::setAppId()/01");
        console.log("dev-sync::IdeAgentService::setAppId()/this.svSio.socket:", this.svSio.socket);
        localStorage.removeItem("appId");
        // localStorage.setItem('appId', this.svBase.getGuid());
    }
    initSioClient() {
        const appId = localStorage.getItem("appId");
        console.log("dev-sync::IdeAgentService::setAppId()/appId:", appId);
        const envl = this.configPushPayload("register-client", "push-registered-client", 1000);
        console.log("dev-sync::IdeAgentService::setAppId()/envl:", envl);
        this.svSio.sendPayLoad(envl);
        // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu
        this.listen("push-registered-client");
        this.listen("push-msg-relayed");
        this.listen("push-msg-pushed");
        this.listen("push-delivered");
        this.listen("msg-relayed");
        this.listen("msg-menu");
        this.listen("push-menu");
        this.sendSioMessage(envl);
    }
    // const x = [
    //   {
    //     triggerEvent: 'register-client',
    //     emittEvent: 'push-registered-client',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'srv-received',
    //     emittEvent: 'push-srv-received',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'msg-relayed',
    //     emittEvent: 'push-msg-relayed',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'msg-pushed',
    //     emittEvent: 'push-msg-pushed',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'msg-received',
    //     emittEvent: 'push-delivered',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'msg-completed',
    //     emittEvent: 'push-msg-completed',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'register',
    //     emittEvent: 'registered',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'login',
    //     emittEvent: 'push-menu',
    //     sFx: 'pushEnvelop'
    //   },
    //   {
    //     triggerEvent: 'send-memo',
    //     emittEvent: 'push-memo',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'send-pub',
    //     emittEvent: 'push-pub',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'send-react',
    //     emittEvent: 'push-react',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'send-menu',
    //     emittEvent: 'push-menu',
    //     sFx: 'push'
    //   },
    //   {
    //     triggerEvent: 'send-notif',
    //     emittEvent: 'push-notif',
    //     sFx: 'push'
    //   }
    // ]
    // push-registered-client, push-srv-received, push-msg-relayed, push-msg-pushed, push-delivered, push-msg-completed, push-srv-received, registered, push-menu, push-memo
    listen(event) {
        console.info("cd-shell/dev-sync::IdeAgentService::listen/event:", event);
        // Listen for incoming messages
        this.svSio.sioListen(event).subscribe({
            next: (payLoad) => {
                // console.log('cd-shell/dev-sync::IdeAgentService::listen/Received payLoad:', payLoadStr);
                // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
                console.log("dev-sync::IdeAgentService::pushSubscribe()/payLoad:", payLoad);
                // Handle the message payload
                // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu
                switch (payLoad.pushData.emittEvent) {
                    case "push-msg-relayed":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-relayed/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-relayed/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-msg-relayed event");
                        this.updateRelayed(payLoad);
                        break;
                    case "push-msg-pushed":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-pushed/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-pushed/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-msg-pushed event");
                        this.notificationAcceptDelivery(payLoad);
                        break;
                    case "push-delivered":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-delivered/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-delivered/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-delivered-client event");
                        this.notificationMsgComplete(payLoad);
                        break;
                    case "push-registered-client":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-registered-client/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-registered-client/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-registered-client event");
                        this.saveSocket(payLoad);
                        break;
                    case "msg-relayed":
                        console.log("dev-sync::IdeAgentService::listenSecure()/msg-relayed/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/msg-relayed/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle msg-relayed event");
                        break;
                    case "push-msg-completed":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-completed/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-msg-completed/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-msg-completed event");
                        break;
                    case "push-srv-received":
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-srv-received/:payLoad.pushData.emittEvent:", payLoad.pushData.emittEvent);
                        console.log("dev-sync::IdeAgentService::listenSecure()/push-srv-received/:payLoad.pushData.triggerEvent:", payLoad.pushData.triggerEvent);
                        console.log("handle push-srv-received event");
                        break;
                    // case 'push-menu':
                    //   console.log('dev-sync::IdeAgentService::listenSecure()/push-menu/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
                    //   console.log('dev-sync::IdeAgentService::listenSecure()/push-menu/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
                    //   console.log('dev-sync::IdeAgentService::listenSecure()/push-menu/:payLoad:', payLoad)
                    //   console.log("handle push-menu event")
                    //   this.routParams.queryParams.token = payLoad.pushData.token;
                    //   // this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
                    //   // load appropriate menu
                    //   // this.htmlMenu(payLoad.resp.data,payLoad.pushData.token);
                    //   break;
                }
            },
            error: (error) => {
                console.error("cd-shell/dev-sync::IdeAgentService::listen/Error receiving message:", error);
            },
            complete: () => {
                console.log("cd-shell/dev-sync::IdeAgentService::listen/Message subscription complete");
            },
        });
    }
    notificationAcceptDelivery(payLoad) {
        console.log("cdUiLib::SioClientService::notificationAcceptDelivery()/01");
        console.log("cdUiLib::SioClientService::notificationAcceptDelivery()/senderAcceptDelivery:", payLoad);
        /**
         * update record of payload
         * - delivered time
         * - delivered = true
         * - isNotification = true
         */
        payLoad.pushData.commTrack.deliveryTime = Number(new Date());
        payLoad.pushData.commTrack.delivered = true;
        payLoad.pushData.isNotification = true;
        payLoad.pushData.triggerEvent = "msg-received";
        /**
         * reverse sender and receiver subTypeId
         */
        // this.sendPayLoad(payLoad);
        this.sendSioMessage(payLoad);
    }
    notificationMsgComplete(payLoad) {
        console.log("cdUiLib::SioClientService::notificationMsgComplete()/01");
        console.log("cdUiLib::SioClientService::notificationMsgComplete()/1:", payLoad);
        /**
         * update record of payload
         * - delivered time
         * - delivered = true
         * - isNotification = true
         */
        payLoad.pushData.commTrack.completedTime = Number(new Date());
        payLoad.pushData.commTrack.completed = true;
        payLoad.pushData.isNotification = true;
        payLoad.pushData.triggerEvent = "msg-completed";
        console.log("cdUiLib::SioClientService::notificationMsgComplete/2:", payLoad);
        /**
         * reverse sender and receiver subTypeId
         */
        // this.sendPayLoad(payLoad);
        this.sendSioMessage(payLoad);
    }
    sendSioMessage(envl) {
        console.info("dev-sync::IdeAgentService::sendSioMessage/envl:", envl);
        this.svSio.sendMessageV2(envl.pushData.triggerEvent, envl).subscribe({
            next: (response) => {
                console.log("Message sent successfully:", response);
            },
            error: (error) => {
                console.error("Error sending message:", error);
            },
            complete: () => {
                console.log("Message sending complete");
            },
        });
    }
    /**
     * This method facilites the initial configuration of a push payload.
     * The payload (ICdPushEnvelop.pushData.m) where 'm' is the message body, is set
     * by the caller of this method.
     * @param triggerEvent
     * @param emittEvent
     * @param cuid
     * @returns
     */
    configPushPayload(triggerEvent, emittEvent, cuid) {
        console.log("starting dev-sync::IdeAgentService::configPushPayload()");
        /**
         * Everytime this method is called it generates a new resourceGuid
         * Notice the setting for CdObjId.resourceName which is the name of this service
         */
        this.resourceGuid = this.b.getGuid();
        const pushEnvelope = {
            pushData: {
                pushGuid: "",
                m: "",
                pushRecepients: [],
                triggerEvent: "",
                emittEvent: "",
                token: "",
                isNotification: null,
                appSockets: this.socketData,
                isAppInit: true,
                commTrack: {
                    initTime: Number(new Date()),
                    relayTime: null,
                    relayed: false,
                    pushed: false,
                    pushTime: null,
                    deliveryTime: null,
                    delivered: false,
                    completed: false,
                    completedTime: null,
                },
            },
            req: null,
            resp: null,
        };
        console.log("dev-sync::IdeAgentService::configPushPayload()/this.resourceGuid:", this.resourceGuid);
        const key = this.resourceGuid;
        const cdObj = {
            appId: localStorage.getItem("appId"),
            // ngModule: 'UserFrontModule',
            cdModule: "dev-sync",
            resourceName: "IdeAgentService",
            resourceGuid: this.resourceGuid,
            jwtToken: this.jwtWsToken,
            socket: null,
            socketId: "",
            commTrack: {
                initTime: Number(new Date()),
                relayTime: null,
                relayed: false,
                pushed: false,
                pushTime: null,
                deliveryTime: null,
                delivered: false,
                completed: false,
                completedTime: null,
            },
        };
        localStorage.setItem(key, JSON.stringify(cdObj));
        const users = [
            {
                userId: cuid,
                subTypeId: 1,
                cdObjId: cdObj,
            },
        ];
        const envl = { ...pushEnvelope };
        envl.pushData.triggerEvent = triggerEvent;
        envl.pushData.emittEvent = emittEvent;
        // set sender
        const uSender = { ...users[0] };
        uSender.subTypeId = 1;
        envl.pushData.pushRecepients.push(uSender);
        if (triggerEvent === "login") {
            console.info("dev-sync::IdeAgentService::configPushPayload()/triggerEvent==login:");
            // set recepient
            console.info("dev-sync::IdeAgentService::configPushPayload()/this.InitData:", JSON.stringify(this.InitData));
            console.info("dev-sync::IdeAgentService::configPushPayload()/this.InitData.value:", JSON.stringify(this.InitData.value));
            const uRecepient = { ...users[0] };
            uRecepient.subTypeId = 7;
            console.info("dev-sync::IdeAgentService::configPushPayload()/uRecepient:", JSON.stringify(uRecepient));
            uRecepient.cdObjId = this.InitData.value;
            envl.pushData.pushRecepients.push(uRecepient);
        }
        console.info("dev-sync::IdeAgentService::configPushPayload()/envl:", JSON.stringify(envl));
        return envl;
    }
    /**
     * No action is expected from sender.
     * No message to send to server
     * Optionally, the sender can do its own house
     * data updates and records.
     * @param payLoad
     */
    updateRelayed(payLoad) {
        console.log("updateRelayed()/01");
        console.log("updateRelayed()/payLoad:", payLoad);
        /**
         * update record of send messages
         */
    }
    // End of corpdesk-rfc-0004 protocol methods
    /////////////////////////////////////////////
    saveSocket(payLoad) {
        console.log("dev-sync::IdeAgentService::saveSocket()/payLoad:", payLoad);
        /**
         * - get socketStore
         * - search socketStore for item with name='appInit'
         * - remove existing item with the same key
         * - save socketData to LocalStorage with resourceGuide as reference
         */
        const socketData = payLoad.pushData.appSockets.filter(appInit);
        function appInit(s) {
            if (s.name === "appInit") {
                return s;
            }
            else {
                return null;
            }
        }
        if (socketData.length > 0) {
            const socketStr = JSON.stringify(socketData);
            localStorage.removeItem("socketData");
            localStorage.setItem("socketData", socketStr);
        }
    }
    // ------------------------------------------------------------
    // 🧩 Save Detection Logic
    // ------------------------------------------------------------
    /**
     * Watch for developer save events
     */
    startSaveWatcher() {
        const watchPath = path.resolve(config.viteWorkspacePath || process.cwd());
        console.info(`[IDE Agent] Watching for changes in: ${watchPath}`);
        try {
            fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                if (filename && (eventType === "change" || eventType === "rename")) {
                    this.onSave(filename);
                }
            });
        }
        catch (err) {
            console.error("[IDE Agent] File watcher failed:", err);
        }
    }
    /**
     * On save event — build payload and send via cd-sio
     */
    async onSave(filename) {
        console.info("[IDE Agent] File changed:", filename);
        const envl = this.configPushPayload("send-pub", "push-pub", 1000 // dev ID or anonymous
        );
        envl.pushData.m.fileChanged = filename;
        if (config.push.wsMode === "sio") {
            this.sendSioMessage(envl);
        }
    }
    async handleAuthAttempt(source, data) {
        console.log("[IDE Agent] Handling AUTH_ATTEMPT for:", data.username);
        const isValid = data.password === "1234";
        const message = isValid
            ? `✅ Auth success for ${data.username}`
            : `❌ Auth failed for ${data.username}`;
        const response = {
            source: { appId: localStorage.getItem("appId") },
            target: source.appId,
            action: "AUTH_RESULT",
            data: { success: isValid, message },
        };
        const envl = this.configPushPayload("send-pub", "push-pub", 1000 // dev ID or anonymous
        );
        envl.pushData.m.response = response;
        if (config.push.wsMode === "sio") {
            this.sendSioMessage(envl);
        }
        console.log("[IDE Agent] Sent AUTH_RESULT back to runtime.");
    }
}
