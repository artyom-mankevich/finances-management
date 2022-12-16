import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  cutOffNumber(control: AbstractControl, maxLength: number = 16) {
    let value: number = control.value;
    if (!value || isNaN(value)) {
      return;
    }
    if (value > 99999999999999999999) {
      control.patchValue(99999999999999999999.);
      return;
    }
    if (!Number.isInteger(value) && value.toString().split('.')[1].length > 10) {
      value = Number.parseFloat(value.toFixed(10));
      control.patchValue(value);
      return;
    }
    if (value.toString().length > maxLength) {
      value = Number.parseFloat(value.toString().slice(0, maxLength));
      control.patchValue(value);

    }

  }

  constructor() { }
}
