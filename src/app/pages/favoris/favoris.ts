import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarteRecette } from '../../components/carte-recette/carte-recette';
import { LEGUMES } from '../../data/legumes';
import { Legume } from '../../models/legume';
import { Favoris } from '../../services/favoris';

@Component({
  selector: 'app-page-favoris',
  imports: [CarteRecette, RouterLink],
  templateUrl: './favoris.html',
  styleUrl: './favoris.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFavoris {
  protected readonly favoris = inject(Favoris);

  protected readonly legumes = computed(() =>
    this.favoris
      .legumes()
      .map((id) => LEGUMES.find((l) => l.id === id))
      .filter((l): l is Legume => !!l),
  );
}
