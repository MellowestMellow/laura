import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appValidaciones]'
})
export class ValidacionesDirective {

  @Input() blockSpaces: boolean = false;
  @Input() blockNumbers: boolean = false;
  @Input() nameValidation: boolean = false;
  @Input() nameValidationTwoWords: boolean = false;
  @Input() phoneValidation: boolean = false;
  @Input() onlyNumbersValidation: boolean = false;
  @Input() emailValidation: boolean = false;
  @Input() blockSQLInjection: boolean = false;
  @Input() normalTextValidation: boolean = false;
  @Input() blockSpecialChars: boolean = false;
  @Input() blockEmojis: boolean = false;

  private isValidInput(text: string, currentValue: string = ''): boolean {

    // ========================
    // Validación solo números
    // ========================
    if (this.onlyNumbersValidation) {
      const maxLength = 15;
      if ((currentValue + text).length > maxLength) {
        return false;
      }
      return /^[0-9]*$/.test(text);
    }

    // ========================
    // Bloquear espacios
    // ========================
    if (this.blockSpaces && /\s/.test(text)) {
      return false;
    }

    // ========================
    // Bloquear números
    // ========================
    if (this.blockNumbers && /\d/.test(text)) {
      return false;
    }

    // ========================
    // Validación de nombres (una palabra)
    // ========================
    if (this.nameValidation) {
      return /^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]*$/.test(text);
    }

    // ========================
    // Validación de nombres (dos palabras)
    // ========================
    if (this.nameValidationTwoWords) {
      const spaceCount = (currentValue.match(/ /g) || []).length;
      if (spaceCount >= 1 && text.includes(' ')) {
        return false;
      }
      return /^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ ]*$/.test(text);
    }

    // ========================
    // Validación de teléfono
    // ========================
    if (this.phoneValidation) {
      return /^[0-9+\-() a-zA-Z]*$/.test(text);
    }

    // ========================
    // Validación de email
    // ========================
    if (this.emailValidation) {
      return /^[a-zA-Z0-9@._-]*$/.test(text);
    }

    // ========================
    // Bloqueo de inyección SQL
    // ========================
    if (this.blockSQLInjection) {
      const forbiddenWords = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', 'ALTER', 'CREATE', 'EXEC'
      ];

      const textUpper = text.toUpperCase();

      for (const word of forbiddenWords) {
        const pattern = new RegExp(`\\b${word}\\b`);
        if (pattern.test(textUpper)) {
          return false;
        }
      }

      if (/--|\/\*/.test(text)) {
        return false;
      }
    }

    // ========================
    // Validación de texto normal
    // ========================
    if (this.normalTextValidation) {
      // Solo caracteres válidos
      const validChars = /^[a-zA-Z0-9áéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ .,;:!?'"()\-\n\r]*$/;
      if (!validChars.test(text)) {
        return false;
      }

      const currentWithNewChar = currentValue + text;

      // 1 espacio máximo consecutivo
      if (/ {2,}/.test(currentWithNewChar)) {
        return false;
      }

      // 🔹 Regla 1: No más de 5 letras iguales SEGUIDAS
      if (/([a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ])\1{5,}/.test(currentWithNewChar)) {
        return false;
      }

      // 🔹 Regla 2: No más de 20 números iguales SEGUIDOS
      if (/(\d)\1{8,}/.test(currentWithNewChar)) {
        return false;
      }

      // 🔹 Regla 3: Signos → solo 1 seguido
      if (/([.,;:!?'"()\-\n\r])\1/.test(currentWithNewChar)) {
        return false;
      }

      return true;
    }

    // ========================
    // Bloquear caracteres especiales
    // ========================
    if (this.blockSpecialChars) {
      if (/[<>{}\[\]`~|]/.test(text)) {
        return false;
      }
    }

    // ========================
    // Bloquear emojis
    // ========================
    if (this.blockEmojis) {
      if (/[^ -~\n\r]/.test(text)) {
        return false;
      }
    }

    return true;
  }

  // ========================
  // Teclado
  // ========================
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const specialKeys = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
      'ArrowDown', 'Tab', 'Delete'
    ];

    if (specialKeys.includes(event.key)) return;

    const input = event.target as HTMLInputElement;
    if (!this.isValidInput(event.key, input.value)) {
      event.preventDefault();
    }
  }

  // ========================
  // Pegado
  // ========================
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;

    if (!this.isValidInput(pastedData, input.value)) {
      event.preventDefault();
    }
  }

    // ========================
  // Input completo (nuevo)
  // ========================
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    if (!this.blockSQLInjection) return; // solo aplicar si está activado

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    // reemplaza las palabras prohibidas
    const cleanedValue = currentValue.replace(/SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC/gi, '');
    if (cleanedValue !== currentValue) {
      input.value = cleanedValue;
    }
  }
}
