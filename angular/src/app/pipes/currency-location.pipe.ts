import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyFormat } from '../enums/currencyFormat';

@Pipe({
  name: 'currencyLocation'
})
export class CurrencyLocationPipe implements PipeTransform {

  transform(value: string, currency: string, currencyLocationSetting: string): string {
    if (currencyLocationSetting === CurrencyFormat.left) {
      return currency + value;
    }
    return value + ' ' + currency;
  }

}
