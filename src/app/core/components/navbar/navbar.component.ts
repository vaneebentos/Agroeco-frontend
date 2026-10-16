import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CotizacionService } from '../../services/cotizacion.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  cotizacionService = inject(CotizacionService);

  isLargeText = false;
  isHighContrast = false;

  toggleLargeText() {
    this.isLargeText = !this.isLargeText;
    document.body.classList.toggle('large-text', this.isLargeText);
  }

  toggleHighContrast() {
    this.isHighContrast = !this.isHighContrast;
    document.body.classList.toggle('high-contrast', this.isHighContrast);
  }
}
