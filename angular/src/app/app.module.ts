import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { AuthModule, AuthHttpInterceptor } from '@auth0/auth0-angular';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { HomeComponent } from './components/home/home.component';
import { LoaderSpinnerComponent } from './components/loader-spinner/loader-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from  '@angular/common/http';

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
      httpInterceptor: {
        allowedList: [`${environment.baseUrl}${ApiEndpoints.test}`]
      }
    }),
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
