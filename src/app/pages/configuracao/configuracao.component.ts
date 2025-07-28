import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SistemaDto, SistemaService } from '../../shared/service/sistema.service';
import { UsuarioSistemaDto } from '../../shared/service/usuario-sistema/models/usuario-sistema-dto';
import { UsuarioSistemaService } from '../../shared/service/usuario-sistema/usuario-sistema.service';
import { UsuarioSistemaForm } from '../../shared/service/usuario-sistema/models/usuario-sistema-form';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracao.component.html',
})
export class ConfiguracaoComponent implements OnInit {

  sistemasDto: SistemaDto[] = [];
  sistemaSelecionadoId: number | null = null;
  linkAtual: UsuarioSistemaDto | null = null;

  constructor(
    private usuarioSistemaService: UsuarioSistemaService,
    private sistemaService: SistemaService
  ) {}

  ngOnInit(): void {
    this.linkAtual = {
      ussTxLink: '',
      ussTxPixelFacebook: ''
    }

    this.carregarSistemas();
  }

  carregarSistemas(): void {
    this.sistemaService.listarSistemas().subscribe({
      next: (res) => {
        this.sistemasDto = res;
      }
    });
  }

  carregarLink() {
    this.usuarioSistemaService.buscarPorId(this.sistemaSelecionadoId!).subscribe(res => {
      this.linkAtual = res;
    });
    
  }

  salvarLink() {

    const form: UsuarioSistemaForm = {
      sisNrId: this.sistemaSelecionadoId!,
      ussTxLink: this.linkAtual!.ussTxLink,
      ussTxPixelFacebook: this.linkAtual?.ussTxPixelFacebook!
    };

    if(!this.linkAtual?.ussNrId) { 
      this.usuarioSistemaService.salvar(form).subscribe(() => {
        alert('Link salvo com sucesso!');
      });
    } else {
      this.usuarioSistemaService.atualizar( this.linkAtual.ussNrId, form).subscribe(() => {
        alert('Link atualizado com sucesso!');
      });
    }
  }

}
