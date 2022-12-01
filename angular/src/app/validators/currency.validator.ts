import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { DataStorageService } from '../services/data-storage.service';
@Injectable()

export class CurrencyValidator {
    constructor(private dss: DataStorageService) {}

    allowedCurrency(control: AbstractControl) : ValidationErrors | null {
        if((!this.dss.currencies.map(c => c.code).includes(control.value))){
            return {disallowedCurrency: true}
        }
        return null;
    }
}