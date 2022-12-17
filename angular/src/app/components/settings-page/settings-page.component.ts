import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, tap } from 'rxjs';
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
  currentSettings: AccountSettings = {
    id: null,
    mainCurrency: 'USD',
    userId: null,
    dateFormat: DateFormat.long,
    startPage: 'Overview',
    currencyFormat: 'left'
  };
  dateFormat = DateFormat;
  currencyFormat = CurrencyFormat;
  startingDay = StartingDay
  userSettings$: Observable<AccountSettings | undefined> = this.ds.getUserSettings().pipe(tap(val => { 
    if (val) {
      this.currentSettings = val;
      this.updateForm(); 
    }
  }));
  constructor(public dss: DataStorageService, private auth: AuthService, private ds: DataService, private fb: FormBuilder, private cv: CurrencyValidator, private router: Router) {
    this.form = this.fb.group({
      mainCurrency: [this.currentSettings?.mainCurrency, [Validators.required,  this.cv.allowedCurrency.bind(this.cv)]],
      dateFormat: [this.currentSettings?.dateFormat, Validators.required],
      startingPage: [this.currentSettings?.startPage, Validators.required],
      currencyFormat: [this.currentSettings?.currencyFormat, Validators.required]
    })
  }

  updateForm() {
    this.form.patchValue({
      mainCurrency: this.currentSettings?.mainCurrency,
      dateFormat: this.currentSettings?.dateFormat,
      startingPage: this.currentSettings?.startPage,
      currencyFormat: this.currentSettings?.currencyFormat
    })
  }
  ngOnInit(): void {
  }

  logout() {
    this.auth.logout({
      returnTo: window.location.origin
    });
  }

  saveSettings() {
    this.ableToSubmit = false;
    this.currentSettings = {
      id: this.currentSettings.id,
      mainCurrency: this.form.controls['mainCurrency'].value,
      userId: null,
      dateFormat: this.form.controls['dateFormat'].value,
      startPage: this.form.controls['startingPage'].value,
      currencyFormat: this.form.controls['currencyFormat'].value
    }
    this.ds.saveUserSettings(this.currentSettings).subscribe(() => { this.router.navigateByUrl('/home') }, error => this.ableToSubmit = true);
  }

}
