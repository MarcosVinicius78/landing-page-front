import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioSistemaDto } from './models/usuario-sistema-dto';
import { environment } from '../../../../environments/environment';
import { UsuarioSistemaForm } from './models/usuario-sistema-form';

@Injectable({
  providedIn: 'root'
})
export class UsuarioSistemaService {
  private apiUrl = environment.apiUrl + '/link';

  constructor(private http: HttpClient) {}

  listarTodos(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<any>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<UsuarioSistemaDto> {
    return this.http.get<UsuarioSistemaDto>(`${this.apiUrl}/sistema/${id}`);
  }

  salvar(form: UsuarioSistemaForm): Observable<UsuarioSistemaDto> {
    return this.http.post<UsuarioSistemaDto>(this.apiUrl, form);
  }

  atualizar(id: number, form: UsuarioSistemaForm): Observable<UsuarioSistemaDto> {
    return this.http.put<UsuarioSistemaDto>(`${this.apiUrl}/${id}`, form);
  }

  apagar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
