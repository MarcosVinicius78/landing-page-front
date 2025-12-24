import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SistemaDto {
  sisNrId: number;
  sisTxNome: string;
}

@Injectable({
  providedIn: 'root'
})
export class SistemaService {

  private apiUrl = environment.apiUrl + '/sistema';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  listarSistemas(): Observable<SistemaDto[]> {
    return this.http.get<SistemaDto[]>(this.apiUrl);
  }

  getDadosPorDominio() {
    let dominio = '';
    if (isPlatformBrowser(this.platformId)) {
      dominio = window.location.hostname;
    }

    if (dominio.includes('sergipeofertas')) {
      return 'sergipeofertas';
    } else if (dominio.includes('ofertasmaiscupons')) {
      return 'ofertasmaiscupons';
    } else if (dominio.includes('localhost')) {
      return 'sergipeofertas';
    }else if (dominio.includes('alagoasofertas')) {
      return 'alagoasofertas';
    } else if (dominio.includes('bahiaofertas')) {
      return 'bahiaofertas';
    }

    return;
  }

  buscarSistemaPorNome(sisTxNome: string): Observable<SistemaDto> {
    const params = new HttpParams().set('sisTxNome', sisTxNome);
    return this.http.get<SistemaDto>(`${this.apiUrl}/buscar-sistema`, { params });
  }

}
