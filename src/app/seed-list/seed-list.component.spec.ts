import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedListComponent } from './seed-list.component';

describe('SeedListComponent', () => {
  let component: SeedListComponent;
  let fixture: ComponentFixture<SeedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
