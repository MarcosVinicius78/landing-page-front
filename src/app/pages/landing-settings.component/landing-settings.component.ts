import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonConfig, DEFAULT_LANDING, LandingConfig } from './model/landing-config.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingService } from './service/landing.service';
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ArquivoImagemService } from './service/arquivoImagem.service';

@Component({
  selector: 'app-landing-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularEditorModule],
  templateUrl: './landing-settings.component.html',
  styleUrl: './landing-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSettingsComponent implements OnInit {

  readonly landingPageService = inject(LandingService);
  readonly sistemaService = inject(SistemaService);
  readonly arquivoImagemService = inject(ArquivoImagemService);

  config: LandingConfig = DEFAULT_LANDING;

  sistemasDto: SistemaDto[] = [];
  sistemasSelecionadoDto!: SistemaDto;
  arquivoSelecionado!: File;

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
    this.carregarSistemas();
  }

  sistemaEscolhido (){
    this.carregarConfiguracoesLanding();
    this.carregarImagem();
  }

  carregarConfiguracoesLanding() {
    this.landingPageService.buscarConfiguracaoPorIdSistema(this.sistemasSelecionadoDto.sisNrId).subscribe({
      next: (data: any) => {
        this.config = data;
      },
      error: (err) => {
        console.error('Erro ao buscar configuração da landing page:', err);
      }
    });
  }

  onFileSelected(event: any) {
    this.arquivoSelecionado = event.target.files[0];
  }

  enviarImagem() {
    if (!this.arquivoSelecionado) {
      return;
    }

    this.arquivoImagemService.uploadImagem(this.sistemasSelecionadoDto.sisNrId, this.arquivoSelecionado).subscribe({
      next: () => console.log('Enviado com sucesso!'),
      error: (err) => console.error(err),
    });
  }

  imagemUrl: string | undefined;

  carregarImagem() {
    this.arquivoImagemService.buscarImagem(1).subscribe({
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
    if (this.imagemUrl && this.config.backgroundType === 'IMAGE') {
      return { 'background-image': `url(${this.imagemUrl})` };
    }
    return { 'background-color': this.config.backgroundValue };
  }

  removeButton(_t48: number) {

  }

  addButton() {
    this.config?.botoes.push({ bocTxDescricao: 'Novo Botão' });
  }

  salvarConfig() {

    if (this.config.lacNrId) {
      this.landingPageService.atualizarConfiguracao(this.sistemasSelecionadoDto.sisNrId, this.config).subscribe({
        next: (data: LandingConfig) => {
          alert('Configuração salva com sucesso:');
        },
        error: (err) => {
          console.error('Erro ao salvar configuração da landing page:', err);
        }
      });
      this.enviarImagem();
    } else {
      this.landingPageService.salvarConfiguracao(1, this.config).subscribe({
        next: (data: LandingConfig) => {
          alert('Configuração salva com sucesso:');
        },
        error: (err) => {
          console.error('Erro ao salvar configuração da landing page:', err);
        }
      });
      this.enviarImagem();
    }
  }
}
