import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent, ResetPasswordFormComponent, CreateAccountFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import {
  DxButtonModule, DxCheckBoxModule,
  DxColorBoxModule,
  DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule,
  DxFormModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule, DxToastModule,
  DxTooltipModule
} from 'devextreme-angular';
import {BasicAddEditComponent} from "./core/components/basic-add-edit/basic-add-edit.component";
import {CountryComponent} from "./pages/masterdata/country/country.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

const routes: Routes = [
  {
    path: 'country',
    component: CountryComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'create-account',
    component: CreateAccountFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true}), DxDataGridModule, DxFormModule, DxButtonModule, DxTooltipModule, NgForOf, NgIf, ReactiveFormsModule, NgClass, DxTextBoxModule, DxColorBoxModule, DxDateBoxModule, DxTextAreaModule, DxDropDownBoxModule, DxSelectBoxModule, DxCheckBoxModule, DxToastModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    ProfileComponent,
    TasksComponent,
    BasicAddEditComponent,
    CountryComponent
  ]
})
export class AppRoutingModule { }
