import { Component, Inject, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, switchMap } from 'rxjs';
import { ClickRegisterService } from '../../shared/service/click-register.service';
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { UsuarioSistemaDto } from '../../shared/service/usuario-sistema/models/usuario-sistema-dto';
import { UsuarioSistemaService } from '../../shared/service/usuario-sistema/usuario-sistema.service';
import { UsuarioInstagramEnum } from './models/usuario-instagram-enum';
import { Title } from '@angular/platform-browser';

const TIPO = {
  PAGINA: "PAGINA",
  GRUPO: "GRUPO",
  ENCURTADO: "ENCURTADO"
}

export enum SistemaEnum {
  SERGIPE_OFERTAS = "Sergipe Ofertas",
  ALAGOAS_OFERTAS = "Alagoas Ofertas",
  OFERTAS_MAIS_CUPONS = "Ofertas mais cupons"
}

@Component({
  selector: 'app-pagina-captura',
  standalone: true,
  imports: [],
  templateUrl: './pagina-captura.component.html'
})
export class PaginaCapturaComponent implements OnInit, OnDestroy {

  vagas: number = 49;
  intervalo: any;
  readonly VAGAS_MIN = 10;
  readonly VAGAS_MAX = 49;
  readonly STORAGE_KEY = 'vagas_info';
  readonly EXPIRACAO_MS = 1000 * 60 * 60 * 24 * 2; // 2 dias

  private clickRegisterService = inject(ClickRegisterService);

  sisTemaDto = signal<SistemaDto | null>(null);

  usuarioSistemaDto = signal<UsuarioSistemaDto | null>(null)
  userInstagram = UsuarioInstagramEnum;

  sistemaNome = signal<string | null>(null);
  sistemaInstagram = signal<string | null>(null);
  localidadeSistema = signal<string | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sistemaService: SistemaService,
    private usuarioSistemaService: UsuarioSistemaService,
    private titleService: Title
  ) { }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.registrarAcessoNaPagina();

      const dominio = this.sistemaService.getDadosPorDominio();

      if (dominio!.includes('sergipeofertas')) {
        this.titleService.setTitle('Grupos Sergipe');
        this.sistemaNome.set("Sergipe Ofertas")
        this.sistemaInstagram.set("sergipe.ofertas")
        this.localidadeSistema.set("SERGIPE");
      } else if (dominio!.includes('ofertasmaiscupons')) {
        this.titleService.setTitle('Grupos Ofertas mais cupons');
        this.sistemaNome.set("Ofertas Mais Cupons")
        this.sistemaInstagram.set("ofertasmaiscupom")
        this.localidadeSistema.set("O BRASIL");
      } else if (dominio!.includes('alagoasofertas')) {
        this.sistemaNome.set("Alagoas Ofertas")
        this.sistemaInstagram.set("alagoas.ofertas")
        this.titleService.setTitle('Grupos Alagoas');
        this.localidadeSistema.set("ALAGOAS");
      }

      this.carregarSistemaEDados();
      this.#carregarOuInicializarVagas();
      this.#iniciarContador();
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
        }
      });
  }

  registrarAcessoNaPagina() {
    const hoje = new Date().toISOString().slice(0, 10); // ex: '2025-06-11'
    const chaveLocal = `acesso-${hoje}`;
    const jaRegistrado = sessionStorage.getItem(chaveLocal);

    if (!jaRegistrado) {
      const dominio = this.sistemaService.getDadosPorDominio();

      // Define a origem de acordo com o domínio
      let origem: string = "";
      if (dominio!.includes('sergipeofertas')) {
        origem = SistemaEnum.SERGIPE_OFERTAS;
      } else if (dominio!.includes('ofertasmaiscupons')) {
        origem = SistemaEnum.OFERTAS_MAIS_CUPONS;
      } else if (dominio!.includes('alagoasofertas')) {
        origem = SistemaEnum.ALAGOAS_OFERTAS;
      }

      // Registra o acesso no backend com a origem correta
      this.registrar(TIPO.PAGINA, origem);

      // Salva no sessionStorage para evitar novo registro no mesmo dia
      sessionStorage.setItem(chaveLocal, 'true');
    }
  }


  registarClicksParaAcessarGrupo() {
    const hoje = new Date().toISOString().slice(0, 10); // ex: '2025-06-11'
    const chaveLocal = `grupo-${hoje}`;

    const jaRegistrado = sessionStorage.getItem(chaveLocal);

    if (!jaRegistrado) {
      const dominio = this.sistemaService.getDadosPorDominio();

      // Define a origem de acordo com o domínio
      let origem: string = "";
      if (dominio!.includes('sergipeofertas')) {
        origem = SistemaEnum.SERGIPE_OFERTAS;
      } else if (dominio!.includes('ofertasmaiscupons')) {
        origem = SistemaEnum.OFERTAS_MAIS_CUPONS;
      } else if (dominio!.includes('alagoasofertas')) {
        origem = SistemaEnum.ALAGOAS_OFERTAS;
      }

      // Registra no backend
      this.registrar(TIPO.GRUPO, origem);

      // Evita registrar novamente no mesmo dia
      sessionStorage.setItem(chaveLocal, 'true');
    }
  }

  registrar(tipo: string, origem: string) {
    this.clickRegisterService.registrarClique(tipo, origem).subscribe({
      next: () => {
      }
    });
  }

  #carregarOuInicializarVagas() {
    const storage = localStorage.getItem(this.STORAGE_KEY);
    if (storage) {
      const { vagas, timestamp } = JSON.parse(storage);
      const tempoPassado = Date.now() - timestamp;

      if (tempoPassado < this.EXPIRACAO_MS) {
        // Se ainda estiver dentro do período de 2 dias
        this.vagas = Math.max(vagas, this.VAGAS_MIN);
        return;
      }
    }

    // Se expirou ou não existia
    this.vagas = this.VAGAS_MAX;
    this.#salvarNoStorage();
  }

  #iniciarContador() {
    this.intervalo = setInterval(() => {
      if (this.vagas > this.VAGAS_MIN) {
        this.vagas--;
        this.#salvarNoStorage();
      } else {
        clearInterval(this.intervalo);
      }
    }, 3000);
  }

  #salvarNoStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      vagas: this.vagas,
      timestamp: Date.now(),
    }));
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
