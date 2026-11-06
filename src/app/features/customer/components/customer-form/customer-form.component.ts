import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { Customer, CustomerFormData } from '../../models/customer.model';

import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css'
})
export class CustomerFormComponent implements OnChanges {

  @Input() customer: Customer | null = null;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<CustomerFormData>();
  @Output() cancel = new EventEmitter<void>();


  get isEditMode(): boolean {
    return this.customer !== null;
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/.*\S.*/)
      ]
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(1500)
      ]
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9+\-() ]{8,20}$/)
      ]
    }),

    cuit: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]
    })
  });


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer']) {
      if (this.customer) {
        this.form.patchValue({
          name: this.customer.name ?? '',
          email: this.customer.email ?? '',
          phone: this.customer.phone ?? '',
          cuit: this.customer.cuit ?? ''
        });
      } else {
        this.resetForm();
      }
    }
  }


  saveCustomer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }


  cancelForm(): void {
    this.cancel.emit();
  }


  resetForm(): void {
    this.form.reset({
      name: '',
      email: '',
      phone: '',
      cuit: ''
    });
  }


  getError(field: string): string | null {
    const control = this.form.get(field);

    if (!control || (!control.touched && !control.dirty)) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return `Debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres.`;
    }

    if (control.hasError('maxlength')) {
      return `No puede superar los ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    }

    if (control.hasError('email')) {
      return 'Ingrese un email válido.';
    }

    if (control.hasError('pattern')) {
      if (field === 'name') {
        return 'El nombre no puede contener solamente espacios.';
      }

      if (field === 'phone') {
        return 'El teléfono debe tener entre 8 y 20 caracteres y contener solo números o símbolos permitidos.';
      }

      if (field === 'cuit') {
        return 'El CUIT debe contener únicamente números y exactamente 11 dígitos.';
      }
    }

    return null;
  }
}
