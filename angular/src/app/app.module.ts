import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './components/home/home.component';
import { LoaderSpinnerComponent } from './components/loader-spinner/loader-spinner.component';
@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    HomeComponent,
    LoaderSpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot({
      domain: environment.authDomain,
      clientId: environment.authClientId,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
