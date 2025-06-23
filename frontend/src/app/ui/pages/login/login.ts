import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Dados do formulário
  protected username = '';
  protected password = '';
  protected errorMessage = '';

  // Credenciais mockadas
  private readonly MOCK_USER = 'cleide';
  private readonly MOCK_PASS = 'revir321$';

  protected hidePassword = true;

  constructor(private router: Router) {}

  protected onSubmit(): void {
    if (this.username === this.MOCK_USER && this.password === this.MOCK_PASS) {
      // Login bem-sucedido (simulado)
      this.errorMessage = '';
      this.router.navigate(['/sales']);
    } else {
      this.errorMessage = 'Usuário ou senha incorretos';
    }
  }
}