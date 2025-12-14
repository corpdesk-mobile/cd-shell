export class AppStateService {
  state = {
    mode: 'login'
  };
  constructor() {

  }

  getState() {
    return this.state;
  }

  setMode(mode: any) {
    return this.state.mode = mode;
  }
}
