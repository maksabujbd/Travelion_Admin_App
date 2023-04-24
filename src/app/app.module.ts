import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {
  SideNavOuterToolbarModule,
  SideNavInnerToolbarModule,
  SingleCardModule,
} from './layouts';
import {
  FooterModule,
  ResetPasswordFormModule,
  CreateAccountFormModule,
  ChangePasswordFormModule,
  LoginFormModule,
} from './shared/components';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import {DxPopupModule, DxToastModule} from "devextreme-angular";
import {NestedOptionHost} from "devextreme-angular/core";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SideNavInnerToolbarModule,
    SingleCardModule,
    FooterModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    DxButtonModule,
    HttpClientModule,
    DxToastModule,
    DxPopupModule,

  ],
  providers: [AuthService, ScreenService, AppInfoService, DatePipe, NestedOptionHost],
  bootstrap: [AppComponent],
})
export class AppModule {}
