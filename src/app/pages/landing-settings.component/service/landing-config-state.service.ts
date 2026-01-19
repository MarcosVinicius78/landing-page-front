import { computed, inject, Injectable, signal } from '@angular/core';
import { LandingConfig } from '../model/landing-config.model';
import { ArquivoImagemService } from './arquivoImagem.service';

@Injectable({
  providedIn: 'root'
})
export class LandingConfigStateService {

  readonly arquivoImagemService = inject(ArquivoImagemService);
  private readonly _imagemUrl = signal<string | undefined>(undefined);
  readonly imagemUrl = this._imagemUrl.asReadonly();

  private readonly _config = signal<LandingConfig | null>(null);
  readonly config = this._config.asReadonly();

  private readonly _imagemPreviewUrl = signal<string | null>(null);
  readonly imagemPreviewUrl = this._imagemPreviewUrl.asReadonly();

  readonly imagemEfetivaUrl = computed(() => {
    return this._imagemPreviewUrl() ?? this._imagemUrl();
  });

  /** usado ao carregar da API */
  setConfig(cfg: LandingConfig) {
    this._config.set(structuredClone(cfg));
  }

  /** usado pelo formulário */
  update(partial: Partial<LandingConfig>) {
    this._config.update(cfg => ({
      ...(cfg ?? {} as LandingConfig),
      ...structuredClone(partial)
    }));
  }

  clear() {
    this._config.set(null);
  }

  carregarImagem(sisId: number) {
    this.arquivoImagemService.buscarImagem(sisId).subscribe({
      next: (blob) => {
        this._imagemUrl.set(URL.createObjectURL(blob));
      },
      error: () => {
        this._imagemUrl.set(undefined);
      }
    });
  }

  /** preview imediato */
  setImagemPreview(file: File) {
    const url = URL.createObjectURL(file);
    this._imagemPreviewUrl.set(url);
  }

  /** limpar preview (opcional) */
  clearImagemPreview() {
    this._imagemPreviewUrl.set(null);
  }

  /** quando carregar da API */
  setImagemFromApi(url: string) {
    this._imagemPreviewUrl.set(url);
  }

  removeBotao(index: number) {
    this._config.update(cfg => {
      if (!cfg) return cfg;

      return {
        ...cfg,
        botoes: cfg.botoes.filter((_, i) => i !== index)
      };
    });
  }

}
