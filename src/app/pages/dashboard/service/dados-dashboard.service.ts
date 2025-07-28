import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HoraDistribuicao } from '../models/hora-distribuicao';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TotalCliquesDto } from '../models/total-cliques-dto';
import { ComparacaoIntervaloDto } from '../models/comparacao-intervalo-dto';

@Injectable({
  providedIn: 'root'
})
export class DadosDashboardService {

  private readonly apiUrl = environment.apiUrl.concat('/click');
  private readonly http = inject(HttpClient)

  getTotalCliques(data: string, tipo: string): Observable<TotalCliquesDto> {
    const params = new HttpParams()
      .set('data', data)
      .set('tipo', tipo);

    return this.http.get<TotalCliquesDto>(`${this.apiUrl}/total`, { params });
  }

  getCliquesPorFaixa(data: string, horaInicio: string, horaFim: string): Observable<TotalCliquesDto> {
    const params = new HttpParams()
      .set('data', data)
      .set('inicio', horaInicio)
      .set('fim', horaFim);

    return this.http.get<TotalCliquesDto>(`${this.apiUrl}/por-faixa`, { params });
  }

  getCliquesPorHora(data: string): Observable<HoraDistribuicao[]> {
    const params = new HttpParams()
      .set('data', data);

    return this.http.get<HoraDistribuicao[]>(`${this.apiUrl}/por-hora?`, { params });
  }

  compararIntervalos(data: string, inicio1: string, fim1: string, inicio2: string, fim2: string): Observable<ComparacaoIntervaloDto> {
    const params = new HttpParams()
      .set('data', data)
      .set('inicio1', inicio1)
      .set('inicio2', inicio2)
      .set('fim1', fim1)
      .set('fim2', fim2);

    return this.http.get<ComparacaoIntervaloDto>(`${this.apiUrl}/comparar-faixas`, { params });
  }
}
