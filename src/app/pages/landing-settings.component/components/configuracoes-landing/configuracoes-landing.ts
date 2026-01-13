import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SistemaDto, SistemaService } from '../../../../shared/service/sistema.service';
import { DEFAULT_LANDING, LandingConfig } from '../../model/landing-config.model';
import { LandingService } from '../../service/landing.service';
import { Observable, of, switchMap } from 'rxjs';
import { ArquivoImagemService } from '../../service/arquivoImagem.service';
import { AngularEditorModule } from '@kolkov/angular-editor';

@Component({
  selector: 'app-configuracoes-landing',
  standalone: true,
  imports: [FormsModule, CommonModule, AngularEditorModule],
  templateUrl: './configuracoes-landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracoesLanding implements OnInit {

  // Services
  readonly sistemaService = inject(SistemaService);
  readonly landingPageService = inject(LandingService);
  readonly arquivoImagemService = inject(ArquivoImagemService);

  // inputs/outputs
  sisNrIdSelecionado = output<number | null>();
  config = input<LandingConfig>(DEFAULT_LANDING);

  // Variables
  arquivoSelecionado!: File;

  // DTOs
  sistemasDto: SistemaDto[] = [];
  sistemasSelecionadoDto!: SistemaDto;

  ngOnInit(): void {
    this.#carregarSistemas();
  }

  #carregarSistemas(): void {
    this.sistemaService.listarSistemas().subscribe({
      next: (res) => {
        this.sistemasDto = res;
      }
    });
  }

  $salvarConfig(): void {
    const sisId = this.sistemasSelecionadoDto.sisNrId;

    const request$ = this.config().lacNrId
      ? this.landingPageService.atualizarConfiguracao(sisId, this.config())
      : this.landingPageService.salvarConfiguracao(sisId, this.config());

    request$
      .pipe(
        switchMap(() => this.#enviarImagem())
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

  #enviarImagem(): Observable<any> {
    if (!this.arquivoSelecionado) {
      return of(null);
    }

    return this.arquivoImagemService.uploadImagem(
      this.sistemasSelecionadoDto.sisNrId,
      this.arquivoSelecionado
    );
  }

  sistemaEscolhido() {
    this.sisNrIdSelecionado.emit(this.sistemasSelecionadoDto.sisNrId);
  }

  removeButton(botNrId: number) {
    this.config().botoes = this.config().botoes.filter((_, index) => index !== botNrId);
  }

  onFileSelected(event: any) {
    this.arquivoSelecionado = event.target.files[0];
  }

  addButton() {
    this.config()?.botoes.push({ bocTxDescricao: 'Novo Botão' });
  }
}
