import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    let token = '';

    if(isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token-promo')!;
     }
    
    if (token) {
      return true;
    } else {
      this.router.navigate(['/login-painel-administracao']); // Redireciona para a página de login
      return false;
    }
  }
}
