import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, Inject, inject, input, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { DEFAULT_LANDING, LandingConfig } from '../../model/landing-config.model';
import { ArquivoImagemService } from '../../service/arquivoImagem.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LandingConfigStateService } from '../../service/landing-config-state.service';

@Component({
  selector: 'app-visualizacao-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizacao-landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizacaoLanding implements OnInit {

  readonly arquivoImagemService = inject(ArquivoImagemService);
  readonly landingStateService = inject(LandingConfigStateService);

  // inputs//outputs
  // config = signal<LandingConfig | null>(null);
  config = this.landingStateService.config
  sisNrIdSelecionado = input<number | null>(null)

  // variaveis
  imagemUrl = this.landingStateService.imagemEfetivaUrl;
  lastImageId = signal<number | null>(null);
  // imagemPreviewUrl = this.landingStateService.imagemEfetivaUrl;

  backgroundStyle = computed(() => {
    const cfg = this.config();
    const img = this.imagemUrl();

    if (!cfg) return {};

    if (cfg.backgroundType === 'IMAGE' && img) {
      return { 'background-image': `url(${img})` };
    }

    return { 'background-color': cfg.backgroundValue };
  });

  imagemKey = computed(() => {
    const cfg = this.config();
    const sisId = this.sisNrIdSelecionado();

    if (!cfg || !sisId) return null;
    if (cfg.backgroundType !== 'IMAGE') return null;

    return sisId; // ou `${sisId}-${cfg.backgroundValue}` se precisar
  });



  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const key = this.imagemKey();
      if (!key) return;

      this.landingStateService.carregarImagem(key);
    });
  }

  ngOnInit(): void {
    // this.carregarImagem()
  }

  // carregarImagem(sisNrId: number) {

  //   this.arquivoImagemService.buscarImagem(sisNrId).subscribe({
  //     next: (blob) => {
  //       this.imagemUrl.set(URL.createObjectURL(blob));
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       this.imagemUrl.set(undefined);
  //     }
  //   });
  // }

  openUrl(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_self');
    }
  }
}
