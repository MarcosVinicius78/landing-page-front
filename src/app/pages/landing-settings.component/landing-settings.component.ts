import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ButtonConfig, DEFAULT_LANDING, LandingConfig } from './model/landing-config.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingService } from './service/landing.service';
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ArquivoImagemService } from './service/arquivoImagem.service';
import { Observable, of, switchMap } from 'rxjs';
import { ConfiguracoesLanding } from "./components/configuracoes-landing/configuracoes-landing";

@Component({
  selector: 'app-landing-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularEditorModule, ConfiguracoesLanding],
  templateUrl: './landing-settings.component.html',
  styleUrl: './landing-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSettingsComponent implements OnInit {

  readonly landingPageService = inject(LandingService);
  readonly sistemaService = inject(SistemaService);
  readonly arquivoImagemService = inject(ArquivoImagemService);

  config = signal<LandingConfig>(DEFAULT_LANDING);

  sistemasDto: SistemaDto[] = [];
  sistemasSelecionadoDto!: SistemaDto;
  arquivoSelecionado!: File;
  sisNrIdSelecionado = signal<number | null>(null);

  editorConfig = {
    editable: true,
    spellcheck: true,
    height: '150px',
    minHeight: '100px',
    placeholder: 'Digite o cabeçalho...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo']
    ]
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    // this.carregarSistemas();
  }

  sistemaEscolhido() {
    // this.carregarConfiguracoesLanding();
    // this.carregarImagem();
  }

  carregarConfiguracoesLanding(sisNrId: number | null) {
    if (sisNrId === null) {
      alert("Sistema não selecionado.");
      return;
    }

    this.landingPageService.buscarConfiguracaoPorIdSistema(sisNrId).subscribe({
      next: (data: LandingConfig) => {
        this.config.set(data);
      },
      error: (err) => {
        console.error('Erro ao buscar configuração da landing page:', err);
      }
    });

    this.carregarImagem(sisNrId)
  }

  onFileSelected(event: any) {
    this.arquivoSelecionado = event.target.files[0];
  }

  enviarImagem(): Observable<any> {
    if (!this.arquivoSelecionado) {
      return of(null);
    }

    return this.arquivoImagemService.uploadImagem(
      this.sistemasSelecionadoDto.sisNrId,
      this.arquivoSelecionado
    );
  }

  imagemUrl: string | undefined;

  carregarImagem(sisNrId: number) {
    this.arquivoImagemService.buscarImagem(sisNrId).subscribe({
      next: (blob) => {
        this.imagemUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: () => {
        this.imagemUrl = undefined;
      }
    });
  }

  carregarSistemas(): void {
    this.sistemaService.listarSistemas().subscribe({
      next: (res) => {
        this.sistemasDto = res;
      }
    });
  }

  openUrl(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_self');
    }
  }

  getBackgroundStyle() {
    if (!this.imagemUrl || !this.config) return {};
    if (this.imagemUrl && this.config().backgroundType === 'IMAGE') {
      return { 'background-image': `url(${this.imagemUrl})` };
    }
    return { 'background-color': this.config().backgroundValue };
  }

  addButton() {
    this.config().botoes.push({ bocTxDescricao: 'Novo Botão' });
  }

  salvarConfig(): void {
    const sisId = this.sistemasSelecionadoDto.sisNrId;

    const request$ = this.config().lacNrId
      ? this.landingPageService.atualizarConfiguracao(sisId, this.config())
      : this.landingPageService.salvarConfiguracao(sisId, this.config());

    request$
      .pipe(
        switchMap(() => this.enviarImagem())
      )
      .subscribe({
        next: () => {
          alert('Configuração salva com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao salvar configuração da landing page:', err);
        }
      });
  }

}
