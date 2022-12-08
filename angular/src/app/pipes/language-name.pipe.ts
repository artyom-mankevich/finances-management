import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'languageName'
})
export class LanguageNamePipe implements PipeTransform {
  languageName = new Intl.DisplayNames(['en'], {type: 'language'})

  transform(code: string): string | undefined {
 
    return this.languageName.of(code);
  }

}
