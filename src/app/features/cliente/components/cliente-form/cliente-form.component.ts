import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Cliente, ClienteFormData } from '../../models/cliente.model';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnChanges {
  @Input() cliente: Cliente | null = null;
  @Input() errorServidor: string | null = null;

  @Output() guardar = new EventEmitter<ClienteFormData>();
  @Output() cancelar = new EventEmitter<void>();

  formulario = new FormGroup({
    nombre: new FormControl('', {
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

    telefono: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9+\-() ]{8,20}$/)
      ]
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) {
      if (this.cliente) {
        this.formulario.patchValue({
          nombre: this.cliente.nombre ?? '',
          email: this.cliente.email ?? '',
          telefono: this.cliente.telefono ?? ''
        });
      } else {
        this.formulario.reset({
          nombre: '',
          email: '',
          telefono: ''
        });
      }
    }
  }

  guardarCliente(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardar.emit(this.formulario.getRawValue());
  }

  // Cancela la operación
  cancelarFormulario(): void {
    this.cancelar.emit();
  }

  limpiarFormulario(): void {
    this.formulario.reset({
      nombre: '',
      email: '',
      telefono: ''
    });
  }


  obtenerError(campo: string): string | null {
    const control = this.formulario.get(campo);

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
      if (campo === 'nombre') {
        return 'El nombre no puede contener solamente espacios.';
      }

      if (campo === 'telefono') {
        return 'El teléfono debe tener entre 8 y 20 caracteres y contener solo números o símbolos permitidos.';
      }
    }

    return null;
  }

}