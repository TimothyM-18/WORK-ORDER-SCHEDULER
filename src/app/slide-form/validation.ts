import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export function endAfterStartValidator(startControlName: string, endControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const start = formGroup.get(startControlName)?.value as NgbDateStruct;
    const end = formGroup.get(endControlName)?.value as NgbDateStruct;

    if (!start || !end) return null; // skip if one is missing

    const startDate = new Date(start.year, start.month - 1, start.day);
    const endDate = new Date(end.year, end.month - 1, end.day);

    return endDate >= startDate ? null : { endBeforeStart: true };
  };
}
