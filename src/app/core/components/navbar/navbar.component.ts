import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  quoteService = inject(QuoteService);
  private readonly router = inject(Router);

  isLargeText = false;
  isHighContrast = false;
  isAdminMode = false;

  constructor() {
    this.isAdminMode = this.router.url.includes('admin');
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.isAdminMode = event.urlAfterRedirects.includes('admin');
      });
  }

  toggleLargeText() {
    this.isLargeText = !this.isLargeText;
    document.body.classList.toggle('large-text', this.isLargeText);
  }

  toggleHighContrast() {
    this.isHighContrast = !this.isHighContrast;
    document.body.classList.toggle('high-contrast', this.isHighContrast);
  }
}
