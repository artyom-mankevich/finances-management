import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  cutOffNumber(control: AbstractControl, maxLength: number = 10) {
    let value: number = control.value;
    if (!value || isNaN(value)) {
      return;
    }
    if (value > 999999999999999) {
      return  control.patchValue(999999999999999)
    }
    if (value.toString().length > maxLength) {
      value = Number.parseFloat(value.toFixed(maxLength));
      control.patchValue(Number.parseFloat(value.toString().slice(0, maxLength)));
    }
  }

  constructor() { }
}
