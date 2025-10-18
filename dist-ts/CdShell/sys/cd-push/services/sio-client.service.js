import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { io } from "socket.io-client";
export class SioClientService {
    constructor() {
        this.env = null;
        this.jwtToken = "";
        this.message$ = new BehaviorSubject("");
        this.pushDataList = [];
        this.listenSecure = (emittEvent, cls = null, action = null) => {
            console.log("cdUiLib::SioClientService::listenSecure()/01/emittEvent:", emittEvent);
            console.log("cdUiLib::SioClientService::listenSecure()/this.socket:", this.socket);
            if (this.socket) {
                this.socket.on(emittEvent, (payLoadStr) => {
                    /**
                     * - check if confirmation process is enabled
                     * - prepare confirmation message back to sender
                     *    - flag message as recieved
                     *    - set triggerEvent event to 'msg-delivered' for server processing
                     *    - set emittEvent event to 'msg-delivered' for server processing
                     *    - trim (remove unessary load) payload for confirmation message
                     * - send confirmation message to sender
                     */
                    let triggerEvent = null;
                    if (payLoadStr) {
                        console.log("cdUiLib::SioClientService::listenSecure()/emittEvent/01/emittEvent:", emittEvent);
                        console.log("cdUiLib::SioClientService::listenSecure()/payLoadStr:", payLoadStr);
                        const payLoad = payLoadStr;
                        // if (emittEvent === 'push-registered-client') {
                        //   action(cls, payLoadStr)
                        // }
                        // if (emittEvent == 'push-registered-client') {
                        //   action(cls,emittEvent, payLoad)
                        // }
                        if (action) {
                            action(cls, emittEvent, payLoad);
                        }
                        if ("pushData" in payLoad && action) {
                            console.log("cdUiLib::SioClientService::listenSecure/2");
                            if ("triggerEvent" in payLoad.pushData) {
                                console.log("cdUiLib::SioClientService::listenSecure/3");
                                triggerEvent = payLoad.pushData.triggerEvent;
                            }
                            else {
                                console.log("cdUiLib::SioClientService::listenSecure()/triggerEvent missing in payLoad.pushData");
                            }
                        }
                        else {
                            console.log("cdUiLib::SioClientService::listenSecure()/pushData missing in payLoad");
                        }
                        /**
                         *
                         * if emittEvent === 'msg-delivered-push',
                         * it means end of cycle of messaging, no need to
                         * send another confirmation message, so...
                         *    - do not send confirmation message
                         *    -
                         */
                        console.log("cdUiLib::SioClientService::listenSecure/4");
                        console.log("listenSecure()/emittEvent/04/emittEvent:", emittEvent);
                        if (emittEvent === "push-msg-relayed") {
                            /**
                             * proceed with normal message reception,
                             * do not send another emittEvent = 'msg-delivered-push'
                             */
                            console.log("cdUiLib::SioClientService::listenSecure/5");
                            // this.message$.next(payLoadStr);
                        }
                        else {
                            /**
                             * send confirmation massage
                             *  - set triggerEvent = 'msg-delivered'
                             *  - set emittEvent = 'msg-delivered-push'
                             */
                            console.log("cdUiLib::SioClientService::listenSecure/6");
                            if (emittEvent === "push-msg-relayed") {
                            }
                            // else {
                            //   this.sendPayLoad(payLoad)
                            // }
                            if (emittEvent === "push-msg-pushed") {
                                this.notificationAcceptDelivery(payLoadStr);
                            }
                            if (emittEvent === "push-delivered") {
                                this.notificationMsgComplete(payLoadStr);
                            }
                        }
                    }
                });
            }
            else {
                console.log("cdUiLib::SioClientService::listenSecure()/error: socket is invalid");
            }
            return this.message$.asObservable();
        };
    }
    setEnv(env) {
        this.env = env;
    }
    /**
     * - save resource in localStorag so it is sharable
     * with other resources between different client entities
     * - make call to the server to
     *    - save resource in redis for reference by other remote clients
     *    - the same records in redis will be reverenced for persistent socket connection
     */
    registerResource(rGuid) {
        // this.resourceGuid = uuidv4();
        const key = rGuid;
        const value = {
            appId: this.env.appId,
            ngModule: "UserModule",
            resourceName: "SessionService",
            resourceGuid: rGuid,
            jwtToken: "",
            socket: null,
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
        const env = {
            ctx: "Sys",
            m: "CdPush",
            c: "Websocket",
            a: "Create",
            dat: {
                f_vals: [
                    {
                        data: value,
                    },
                ],
                token: "",
            },
            args: {},
        };
        localStorage.setItem(key, JSON.stringify(value));
    }
    /**
     * initiate listeners to various events involved
     * in pushing message via push server
     */
    initSio(cls, action) {
        console.log("cdUiLib::SioClientService::initSio()/01");
        this.socket = io(this.env.sioEndpoint, this.env.sioOptions);
        console.log("cdUiLib::SioClientService::initSio()/this.socket:", this.socket);
        // this.registerResource(rGuid)
        /**
         * injecting extra listeners from
         * implementing class
         */
        // extListiners(this);
        if (action) {
            this.listenSecure("push-registered-client", cls, action).subscribe((payLoadStr) => {
                console.log("initSio::listenSecure/action=push-registered-client");
                console.log("initSio::listenSecure/action=push-registered-client/payLoadStr:", payLoadStr);
                action(cls, "push-registered-client", payLoadStr);
            });
            this.listenSecure("push-msg-pushed", cls, action).subscribe((payLoadStr) => {
                console.log("initSio::listenSecure/action=push-msg-pushed");
                console.log("initSio::listenSecure/action=push-msg-pushed/payLoadStr:", payLoadStr);
                action(cls, "push-msg-pushed", payLoadStr);
            });
        }
        /**
         * Send receives 'push-msg-relayed' event when
         * message has been received by server and pushed
         * to client. No action is expected from the sender
         * listen for notification that a given message has reached the server
         * and ready for pushing
         */
        this.listenSecure("push-msg-relayed").subscribe((payLoadStr) => {
            console.log("cdUiLib::SioClientService::initSio()/listenSecure()/push-msg-relayed/:payLoadStr:", payLoadStr);
            if (payLoadStr) {
                const payLoad = JSON.parse(payLoadStr);
                console.log("cdUiLib::SioClientService::initSio()/listenSecure(msg-relayed)payLoad:", payLoad);
                this.updateRelayed(payLoad);
            }
        });
        /**
         * Recepient waits for notification of messaged pushed
         */
        this.listenSecure("push-msg-pushed").subscribe((payLoadStr) => {
            console.log("cdUiLib::SioClientService::initSio()/listenSecure()/push-delivered/:payLoadStr:", payLoadStr);
            // this confirms a given message was received
            // mark local send message as delivered
            // this.messageList.push(message);
            if (payLoadStr) {
                const payLoad = JSON.parse(payLoadStr);
                // sender to flag that sent message is received
                this.notificationAcceptDelivery(payLoad);
            }
        });
        /**
         * Sender waits for notification to message delivered
         * It responds by sending completion message to server.
         * Server is to save records but no further action
         * Server would mark the commTrack as completed
         * listening by r for notification that a given message
         * has been seccussfully delivered
         */
        this.listenSecure("push-delivered").subscribe((payLoadStr) => {
            console.log("cdUiLib::SioClientService::initSio()/listenSecure()/push-delivered/:payLoadStr:", payLoadStr);
            // this confirms a given message was received
            // mark local send message as delivered
            // this.messageList.push(message);
            if (payLoadStr) {
                const payLoad = JSON.parse(payLoadStr);
                // sender to flag that sent message is received
                this.notificationMsgComplete(payLoad);
            }
        });
    }
    sendMessage(msg) {
        console.log("cdUiLib::SioClientService::sendMessage()/msg", msg);
        if (this.socket) {
            this.socket.emit("message", msg);
        }
        else {
            console.log("cdUiLib::SioClientService::sendMessage() error: socket is invalid");
        }
    }
    sendPayLoad(pushEnvelope) {
        console.log("cdUiLib::SioClientService::sendPayLoad/01/pushEnvelope:", pushEnvelope);
        if ("pushData" in pushEnvelope) {
            if ("pushGuid" in pushEnvelope.pushData) {
                console.log("cdUiLib::SioClientService::sendPayLoad/02/this.socket:", this.socket);
                // every message has a unique id
                // pushEnvelope.pushData.pushGuid = uuidv4();
                if (this.socket) {
                    console.log("cdUiLib::SioClientService::sendPayLoad/:socket is available");
                    const msg = JSON.stringify(pushEnvelope);
                    this.socket.emit(pushEnvelope.pushData.triggerEvent, msg);
                }
                else {
                    console.error("cdUiLib::SioClientService::sendPayLoad/:unable to push message. socket is null");
                }
            }
            else {
                console.error("cdUiLib::SioClientService::sendPayLoad/01/triggerEvent missing in payLoad.pushData");
            }
        }
        else {
            console.error("cdUiLib::SioClientService::sendPayLoad/01/pushData missing in pushEnvelope");
        }
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
        this.sendPayLoad(payLoad);
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
        this.sendPayLoad(payLoad);
    }
    //////////////////////////////////////////////////////////////
    // BORROWED FROM SioTestService
    sendMessageV2(triggerEvent, pushEnvelope) {
        console.log('SioClientTestService::sendMessage2()/:triggerEvent:', triggerEvent);
        console.log('SioClientTestService::sendMessage2()/:payLoadStr:', pushEnvelope);
        const msg = JSON.stringify(pushEnvelope);
        this.socket.emit(triggerEvent, msg);
        return new Observable(observer => {
            this.socket.on('messageSent', (data) => {
                observer.next(data);
                observer.complete();
            });
            this.socket.on('error', (error) => {
                observer.error(error);
            });
        });
    }
    // public listen1(emittEvent: string): Observable<string> {
    //   return new Observable((observer) => {
    //     this.socket.on(emittEvent, (data: string) => {
    //       observer.next(data);
    //     });
    //   });
    // }
    sioListen(emittEvent) {
        return fromEvent(this.socket, emittEvent);
    }
    onUserJoined() {
        return fromEvent(this.socket, 'userJoined');
    }
    onUserLeft() {
        return fromEvent(this.socket, 'userLeft');
    }
    onCustomEvent(eventName) {
        return fromEvent(this.socket, eventName);
    }
}
