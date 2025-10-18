// import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import config from '../../../../config';
export class CdPushController {
    constructor() {
        this.url = '';
        // this.socket = io(`${environment.HOST}:` + environment.SOCKET_IO_PORT);
        // this.socket = io.connect('https://localhost', {secure: true});
        this.url = `${config.push.serverHost}:` + config.push.serverPort;
        // this.socket = io(this.url);
    }
    listen(eventName) {
        return new Observable(subscriber => {
            this.socket.on(eventName, data => {
                subscriber.next(data);
            });
        });
    }
    emit(eventName, data) {
        console.log(`starting CdPushController::emit()`);
        this.socket.emit(eventName, data);
    }
}
