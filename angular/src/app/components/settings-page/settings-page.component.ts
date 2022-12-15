import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { CurrencyFormat } from 'src/app/enums/currencyFormat';
import { DateFormat } from 'src/app/enums/dateFormat';
import { Pages } from 'src/app/enums/pages';
import { StartingDay } from 'src/app/enums/startingDay';
import { AccountSettings } from 'src/app/models/accountSettings';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { CurrencyValidator } from 'src/app/validators/currency.validator';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
  providers: [CurrencyValidator]
})
export class SettingsPageComponent implements OnInit {
  pages = Pages;
  form: FormGroup;
  ableToSubmit: boolean = true;
  currentSettings: AccountSettings | undefined = {
    mainCurrency: 'USD',
    userId: null,
    dateFormat: DateFormat.long,
    firstDay: 7,
    startingPage: 'Overview',
    currencyFormat: 'left'
  };
  dateFormat = DateFormat;
  currencyFormat = CurrencyFormat;
  startingDay = StartingDay
  // userSettings$: Observable<AccountSettings | undefined> = this.ds.getUserSettings(); 
  constructor(public dss: DataStorageService, private auth: AuthService, private ds: DataService, private fb: FormBuilder, private cv: CurrencyValidator) {
    // this.userSettings$.subscribe(val => this.currentSettings = val); 
    this.form = this.fb.group({
      mainCurrency: [this.currentSettings?.mainCurrency, [Validators.required,  this.cv.allowedCurrency.bind(this.cv)]],
      dateFormat: [this.currentSettings?.dateFormat, Validators.required],
      firstDay: [this.currentSettings?.firstDay, Validators.required],
      startingPage: [this.currentSettings?.startingPage, Validators.required],
      currencyFormat: [this.currentSettings?.currencyFormat, Validators.required]
    })
    // this.updateForm();
  }

  // updateForm() {
  //   this.form.patchValue({
  //     mainCurrency: [, Validators.required],
  //     dateFormat: [, Validators.required],
  //     firstDay: [, Validators.required],
  //     startingPage: [, Validators.required],
  //     currencyFormat: [, Validators.required]
  //   })
  // }
  ngOnInit(): void {
  }

  logout() {
    this.auth.logout();
  }

  saveSettings() {
    this.ableToSubmit = false;
    this.currentSettings = {
      mainCurrency: this.form.controls['mainCurrency'].value,
      userId: null,
      dateFormat: this.form.controls['dateFormat'].value,
      firstDay: this.form.controls['firstDay'].value,
      startingPage: this.form.controls['startingPage'].value,
      currencyFormat: this.form.controls['currencyFormat'].value
    }
    this.ds.saveUserSettings(this.currentSettings);
  }

}
