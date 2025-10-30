// Angular Core
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Módulos compartidos
import { PrimeNGImports } from '../../../../primeng.imports';

@Component({
  selector: 'app-contador',
  standalone: true,
  imports: [PrimeNGImports],
  templateUrl: './contador.component.html',
  styleUrls: ['./contador.component.scss'],
})

export class ContadorComponent {

  @Input() texto: string = '';
  @Input() limite!: number;
  @Input() showError: boolean = false;

  @Output() textoChange = new EventEmitter<string>();

  // ────────────────────────────────
  // CONTROL DE ENTRADA DE TEXTO
  // Limita caracteres y emite el nuevo valor del input
  // ────────────────────────────────

  onTextoChange(valor: string): void {
    if (valor.length > this.limite) {
      valor = valor.slice(0, this.limite);
    }
    this.texto = valor;
    this.textoChange.emit(this.texto);
  }
}