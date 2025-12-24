import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { LandingConfig } from '../model/landing-config.model';

@Injectable({
  providedIn: 'root'
})
export class LandingService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  buscarConfiguracaoPorIdSistema(sisNrId: number): Observable<LandingConfig> {
    return this.http.get<LandingConfig>(`${this.apiUrl}/configurar-landing-page/sistema/${sisNrId}`);
  }

  salvarConfiguracao(sisNrId: number, config: LandingConfig): Observable<LandingConfig> {
    return this.http.post<LandingConfig>(`${this.apiUrl}/configurar-landing-page/sistema/${sisNrId}`, config);
  }

  atualizarConfiguracao(sisNrId: number, config: LandingConfig): Observable<LandingConfig> {
    return this.http.put<LandingConfig>(`${this.apiUrl}/configurar-landing-page/sistema/${sisNrId}`, config);
  }
}
