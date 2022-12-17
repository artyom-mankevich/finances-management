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
import { CategoryModalComponent } from './components/category-modal/category-modal.component';
import { StocksPageComponent } from './components/stocks-page/stocks-page.component';
import { StockComponent } from './components/stock/stock.component';
import { NewsEntryComponent } from './components/news-entry/news-entry.component';
import { StockModalComponent } from './components/stock-modal/stock-modal.component';
import { NewsFiltersModalComponent } from './components/news-filters-modal/news-filters-modal.component';
import { NgChartsModule } from 'ng2-charts';
import { StocksChartComponent } from './components/stocks-chart/stocks-chart.component';
import { LanguageNamePipe } from './pipes/language-name.pipe';
import { AnalyticsPageComponent } from './components/analytics-page/analytics-page.component';
import { WalletsBalanceChartComponent } from './components/wallets-balance-chart/wallets-balance-chart.component';
import { TransactionsAmountChartComponent } from './components/transactions-amount-chart/transactions-amount-chart.component';
import { CryptoPageComponent } from './components/crypto-page/crypto-page.component';
import { CryptoWalletModalComponent } from './components/crypto-wallet-modal/crypto-wallet-modal.component';
import { CryptoTransferModalComponent } from './components/crypto-transfer-modal/crypto-transfer-modal.component';
import { CryptoWalletComponent } from './components/crypto-wallet/crypto-wallet.component';
import { OverviewPageComponent } from './components/overview-page/overview-page.component';
import { DebtsPageComponent } from './components/debts-page/debts-page.component';
import { DebtComponent } from './components/debt/debt.component';
import { DebtModalComponent } from './components/debt-modal/debt-modal.component';
import { DebtPaymentModalComponent } from './components/debt-payment-modal/debt-payment-modal.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { CurrencyLocationPipe } from './pipes/currency-location.pipe';
import { InvestmentsPageComponent } from './components/investments-page/investments-page.component';
import { InvestmentModalComponent } from './components/investment-modal/investment-modal.component';

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
    TransactionModalComponent,
    CategoryModalComponent,
    StocksPageComponent,
    StockComponent,
    NewsEntryComponent,
    StockModalComponent,
    NewsFiltersModalComponent,
    StocksChartComponent,
    LanguageNamePipe,
    AnalyticsPageComponent,
    WalletsBalanceChartComponent,
    TransactionsAmountChartComponent,
    CryptoPageComponent,
    CryptoWalletModalComponent,
    CryptoTransferModalComponent,
    CryptoWalletComponent,
    OverviewPageComponent,
    DebtsPageComponent,
    DebtComponent,
    DebtModalComponent,
    DebtPaymentModalComponent,
    SettingsPageComponent,
    CurrencyLocationPipe,
    InvestmentsPageComponent,
    InvestmentModalComponent,
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
    MatIconModule,
    NgChartsModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
