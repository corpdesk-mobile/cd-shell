export class AppStateService {
    constructor() {
        this.state = {
            mode: 'login'
        };
    }
    getState() {
        return this.state;
    }
    setMode(mode) {
        return this.state.mode = mode;
    }
}
