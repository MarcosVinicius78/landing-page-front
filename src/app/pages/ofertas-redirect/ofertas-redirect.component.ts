import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { catchError, of, switchMap } from 'rxjs';
import { UsuarioSistemaService } from '../../shared/service/usuario-sistema/usuario-sistema.service';
import { UsuarioSistemaDto } from '../../shared/service/usuario-sistema/models/usuario-sistema-dto';
import { SistemaEnum } from '../pagina-captura/pagina-captura.component';
import { ClickRegisterService } from '../../shared/service/click-register.service';

const TIPO = {
  PAGINA: "PAGINA",
  GRUPO: "GRUPO",
  ENCURTADO: "ENCURTADO"
}

@Component({
  selector: 'app-ofertas-redirect',
  standalone: true,
  template: '',
  styles: [`
    :host {
      display: block;
      background-color: white;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class OfertasRedirectComponent implements OnInit {

  sisTemaDto = signal<SistemaDto | null>(null);
  usuarioSistemaDto = signal<UsuarioSistemaDto | null>(null)

  private clickRegisterService = inject(ClickRegisterService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sistemaService: SistemaService,
    private usuarioSistemaService: UsuarioSistemaService,
  ) { }

  ngOnInit(): void {
    this.carregarSistemaEDados();
  }

  redirecionarLink() {
    const r = this.route.snapshot.queryParamMap.get('r');

    if (this.usuarioSistemaDto()) {
      window.location.href = this.usuarioSistemaDto()?.ussTxLink!; // redireciona
    } else {
      // Se não encontrar, redireciona para home
      this.router.navigate(['/']);
    }
  }

  carregarSistemaEDados(): void {
    const dominio = this.sistemaService.getDadosPorDominio();
    if (!dominio) return;

    this.sistemaService.buscarSistemaPorNome(dominio)
      .pipe(
        switchMap((sistema) => {
          this.sisTemaDto.set(sistema);
          return this.usuarioSistemaService.buscarPorId(sistema.sisNrId);
        }),
        catchError((err) => {
          console.error('Erro ao carregar dados:', err);
          return of(null);
        })
      )
      .subscribe((usuarioSistema) => {
        if (usuarioSistema) {
          this.inserirPixelDoFacebook(usuarioSistema.ussTxPixelFacebook);
          this.usuarioSistemaDto.set(usuarioSistema);
          this.registrarAcessoNaPagina();
          this.redirecionarLink();
        }
      });
  }

  registrarAcessoNaPagina() {
    const dominio = this.sistemaService.getDadosPorDominio();

    if (dominio) {
      // Define a origem de acordo com o domínio
      let origem: string = "";
      if (dominio!.includes('sergipeofertas')) {
        origem = SistemaEnum.SERGIPE_OFERTAS;
      } else if (dominio!.includes('ofertasmaiscupons')) {
        origem = SistemaEnum.OFERTAS_MAIS_CUPONS;
      } else if (dominio!.includes('alagoasofertas')) {
        origem = SistemaEnum.ALAGOAS_OFERTAS;
      } else if (dominio!.includes('bahiaofertas')) {
        origem = SistemaEnum.BAHIA_OFERTAS;
      }
     
      // Registra o acesso no backend com a origem correta
      this.registrar(TIPO.ENCURTADO, origem);
    }
  }

   registrar(tipo: string, origem: string) {
    this.clickRegisterService.registrarClique(tipo, origem).subscribe({
      next: () => {
      }
    });
  }

  inserirPixelDoFacebook(idPixel: string) {
    // Verifica se o ID do Pixel é fornecido e se o script do Pixel já foi inserido
    if (!idPixel || document.getElementById('fb-pixel')) return;

    // Cria o elemento <script> para o Pixel
    const script = document.createElement('script');
    script.id = 'fb-pixel';
    script.innerHTML = `
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n=f.fbq=function(){n.callMethod ? 
        n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq) f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src='https://connect.facebook.net/en_US/fbevents.js';
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window, document,'script');
    fbq('init', '${idPixel}');
    fbq('track', 'PageView');
  `;

    // Adiciona o script ao <head> do documento
    document.head.appendChild(script);

    // Cria e adiciona o elemento <noscript> como fallback
    const noScript = document.createElement('noscript');
    noScript.innerHTML = `
    <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${idPixel}&ev=PageView&noscript=1"/>
  `;
    document.body.appendChild(noScript);
  }

}
