import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CarteRecette } from '../../components/carte-recette/carte-recette';
import { GROUPES_INGREDIENTS, INDISPENSABLES } from '../../data/ingredients';
import { SelectionRestes } from '../../services/selection-restes';

@Component({
  selector: 'app-mes-restes',
  imports: [CarteRecette],
  templateUrl: './mes-restes.html',
  styleUrl: './mes-restes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesRestes {
  protected readonly selection = inject(SelectionRestes);
  protected readonly groupes = GROUPES_INGREDIENTS;
  protected readonly indispensables = INDISPENSABLES;
}
