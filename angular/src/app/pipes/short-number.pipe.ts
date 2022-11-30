import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {

  transform(val: number, args?: any): any {
    if (val === 0) { 
      return '0'
    }
    if (isNaN(val)) return null;
    if (val === null) return null;
   
    let abs = Math.abs(val);
    const rounder = Math.pow(10, 1);
    const isNegative = val < 0;
    let key = '';

    const powers = [
        {key: 'Q', value: Math.pow(10, 15)},
        {key: 'T', value: Math.pow(10, 12)},
        {key: 'B', value: Math.pow(10, 9)},
        {key: 'M', value: Math.pow(10, 6)},
        {key: 'K', value: 1000}
    ];

    for (let i = 0; i < powers.length; i++) {
        let reduced = abs / powers[i].value;
        reduced = Math.round(reduced * rounder) / rounder;
        if (reduced >= 1) {
            abs = reduced;
            key = powers[i].key;
            break;
        }
    }
    let result: string = (isNegative ? '-' : '') + abs.toString().slice(0,6) + key;
    return result;
}

}
