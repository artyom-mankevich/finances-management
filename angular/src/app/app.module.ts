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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { WalletsPageComponent } from './components/wallets-page/wallets-page.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { AddWalletModalComponent } from './components/add-wallet-modal/add-wallet-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencySymbolPipe } from './pipes/currency-symbol.pipe';
import { TransactionsPageComponent } from './components/transactions-page/transactions-page.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { TransactionModalComponent } from './components/transaction-modal/transaction-modal.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    HomeComponent,
    LoaderSpinnerComponent,
    SidemenuComponent,
    WalletsPageComponent,
    WalletComponent,
    ShortNumberPipe,
    AddWalletModalComponent,
    CurrencySymbolPipe,
    TransactionsPageComponent,
    TransactionComponent,
    TransactionModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot({
      domain: environment.authDomain,
      clientId: environment.authClientId,
      audience: environment.authAudience,
      httpInterceptor: {
        allowedList: [`${environment.baseUrl}${ApiEndpoints.wallets}`,
        `${environment.baseUrl}*`]
      }
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
