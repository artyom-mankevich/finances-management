import { AbstractControl, ValidationErrors } from '@angular/forms';

export class WhiteSpaceValidator {
    static noWhiteSpace(control: AbstractControl): ValidationErrors | null {
        if (control.value === null) {
            return null;
        }
        if ((control.value as string).trim().length === 0) {
            return { noWhiteSpace: true }
        }
        return null;
    }
}