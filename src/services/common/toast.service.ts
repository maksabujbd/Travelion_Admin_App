import { Injectable } from '@angular/core';
import { DxCheckBoxModule, DxToastModule } from 'devextreme-angular';

declare function toastSuccess(title: any,message: any): any;
declare function toastInfo(title: any,message: any): any;
declare function toastError(title: any,message: any): any;
declare function toastWarning(title: any,message: any): any;

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private title = 'Travelion Service';

  constructor() { }

  success (message: any) {
    toastSuccess(this.title, message);
  }

  info (message: any) {
    toastInfo(this.title, message);
  }

  error (message: any) {
    toastError(this.title, message);
  }

  warning (message: any) {
    toastWarning(this.title, message);
  }
}
