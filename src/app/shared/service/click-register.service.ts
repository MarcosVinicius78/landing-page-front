import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HoraDistribuicao } from '../../pages/dashboard/models/hora-distribuicao';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClickRegisterService {

  private apiUrl = environment.apiUrl + '/click';

  constructor(private http: HttpClient) { }

  registrarClique(tipo: string, origem: string) {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('origem', origem);
      console.log('PaginaCapturaComponent construído');

    return this.http.post(this.apiUrl + '/registrar', null, { params });
  }
 
}
