export interface IControllerInfo {
  name: string;
  instance: any; // The controller object (e.g., ctlSignIn)
  template: string;
  default: boolean; // True if this controller is the default view for the module
}