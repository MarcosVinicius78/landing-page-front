import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth-guard';
import { PaginaCapturaComponent } from './pages/pagina-captura/pagina-captura.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', component: PaginaCapturaComponent },
    { path: 'login-painel-administracao', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];
