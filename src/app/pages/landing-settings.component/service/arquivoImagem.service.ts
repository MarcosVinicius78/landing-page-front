import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArquivoImagemService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  uploadImagem(sisNrId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return this.http.post(`${this.apiUrl}/imagem/sistema/${sisNrId}`, formData);
  }

  buscarImagem(sisNrId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/imagem/buscar-imagem/${sisNrId}`, {
      responseType: 'blob',
    });
  }

}
