import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from '../../../core/application/auth';
import { catchError, tap } from 'rxjs';


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
  username = '';
  password = '';
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    const credentials: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).pipe(
      tap((response: LoginResponse) => {
        // Simular armazenamento do token
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.router.navigate(['/sales']);
      }),
      catchError((error) => {
        this.errorMessage = 'Usuário ou senha inválidos';
        throw error;
      })
    ).subscribe();
  }

}