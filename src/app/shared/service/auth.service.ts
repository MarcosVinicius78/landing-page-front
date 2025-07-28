import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenResponse } from '../models/token-response';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private apiUrl = environment.apiUrl + '/auth/login'; // Altere para o URL do seu backend

  constructor(private http: HttpClient) {}

  login(login: { usuTxLogin: string; usuTxSenha: string }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.apiUrl, login);
  }

  getToken(): string | null {
    return localStorage.getItem('token-promo'); // ou onde você armazenou o token
  }
}
