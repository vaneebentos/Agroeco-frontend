import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnaTabla {
  campo: string;
  titulo: string;
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css'
})
export class TablaComponent {

  @Input() columnas: ColumnaTabla[] = [];
  @Input() datos: any[] = [];

  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<any>();

}