import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Encadré « Attention » pour les précautions de sécurité alimentaire. */
@Component({
  selector: 'app-alerte',
  templateUrl: './alerte.html',
  styleUrl: './alerte.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alerte {}
