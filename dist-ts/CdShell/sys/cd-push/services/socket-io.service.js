/**
 * Below is short description of how the cd-push system works:
 * 1. When user login, the push server is registers the user socket connection
 * 2. Additionally register all events required by relevant modules
 * 3. Thereafter, when a module that needs push services is launched, it starts listening to the appropriate events.
 * 4. Any event emitted to the server will then be relayed to the appropriate destination.
 * ToDo:
 * - capacity to register push events via gui system admin
 */
// import { Injectable, Inject } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
// import { EnvConfig } from '@corpdesk/cd-push/src/lib/base';
// import { EnvConfig } from './IBase';
import { BehaviorSubject } from 'rxjs';
import config from '../../../../config';
// import { EnvConfig } from '@corpdesk/core';
// @Injectable({
//   providedIn: 'root'
// })
export class SocketIoService {
    constructor(
    // @Inject('env') private env: EnvConfig,
    ) {
        this.url = '';
        this.message$ = new BehaviorSubject('');
        this.getNewMessage = (eventName) => {
            console.log('cd-push/SocketioService::getNewMessage()/01');
            this.socket.on(eventName, (data) => {
                console.log('cd-push/SocketioService::getNewMessage()/this.socket.on()/eventName:', eventName);
                console.log('cd-push/SocketioService::getNewMessage()/this.socket.on()/data:', data);
                this.message$.next(data);
            });
            return this.message$.asObservable();
        };
        // this.socket = io(`${environment.apiEndpoint}:` + environment.SOCKET_IO_PORT);
        // this.socket = io.connect('https://localhost', {secure: true});
        // this.url = `${this.env.sioEndpoint}`;
        console.log('cd-push/SocketioService::constructor()/this.url:', this.url);
        // console.log('cd-push/SocketioService::constructor()/this.env.sioOptions:', this.env.sioOptions)
        // this.socket = io(`${this.env.sioEndpoint}`,this.env.sioOptions);
        this.socket = io(`${config.cdSio.endpoint}`, config.cdSio.options);
    }
    listen(eventName) {
        console.log('cd-push/SocketioService::listen()/01');
        console.log('cd-push/SocketioService::listen()/eventName:', eventName);
        return new Observable(subscriber => {
            console.log('cd-push/SocketioService::listen()/02');
            return this.socket.on(eventName, (data) => {
                console.log('cd-push/SocketioService::listen()/this.socket.on()/eventName:', eventName);
                console.log('cd-push/SocketioService::listen()/this.socket.on()/data:', data);
                subscriber.next(data);
            });
        });
    }
    listen2(eventName) {
        console.log('cd-push/SocketioService::listen()/01');
        console.log('cd-push/SocketioService::listen()/eventName:', eventName);
        this.socket.on(eventName, (data) => {
            console.log('cd-push/SocketioService::listen()/this.socket.on()/eventName:', eventName);
            console.log('cd-push/SocketioService::listen()/this.socket.on()/data:', data);
        });
    }
    emit(eventName, data) {
        console.log('cd-push/SocketioService::emit()/01');
        // this.socket.emit(eventName, data);
        this.socket.emit(eventName, data, function (state) {
            console.log('cd-push/SocketioService::emit()/02');
            console.log('cd-push/SocketioService::emit()/state:', state);
            if (state.error)
                console.log('Something went wrong on the server. ServerError:', state.error);
            if (state.ok)
                console.log('Event was processed successfully');
        });
    }
}
