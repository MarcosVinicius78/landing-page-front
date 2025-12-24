import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  formLogin!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      usuTxLogin: ['', [Validators.required, Validators.email]],
      usuTxSenha: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.formLogin.valid) {
      const loginData = this.formLogin.value;
      this.authService.login(loginData).subscribe({
        next: (response) => {
          localStorage.setItem('token-promo', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Erro ao fazer login', err);
          alert('Falha na autenticação!');
        }
      });
    } else {
      console.log('Formulário inválido');
    }
  }
}
