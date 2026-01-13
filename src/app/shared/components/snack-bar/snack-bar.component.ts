import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-snack-bar',
  standalone: true,
  imports: [],
  template: `
    <div class="relative">
      <div class="bg-black w-9 h-16"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackBar { }
