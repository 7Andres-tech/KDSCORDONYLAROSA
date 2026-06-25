import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pago-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-error.component.html',
  styleUrl: './pago-error.component.css'
})
export class PagoErrorComponent {

}