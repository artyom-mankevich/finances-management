import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { AuthModule } from '@auth0/auth0-angular';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot({
      domain: 'dev-16fr5mnt2b0eess4.us.auth0.com',
      clientId: 'wJglglq2HWbavW7FtnsOkVvN2ikrPvSf',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
