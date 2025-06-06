import { FormGroup } from '@angular/forms';
import { filter, map, Observable, startWith, take } from 'rxjs';

export const validateForm = (form: FormGroup): Observable<boolean> => {
  return form.statusChanges.pipe(
    startWith(form.status),
    filter((status) => status !== 'PENDING'),
    take(1),
    map((status) => status === 'VALID')
  );
};
