import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { COULEUR_PAR_RESTE, EMOJI_PAR_RESTE } from '../../data/icones-restes';
import { GROUPES_INGREDIENTS_VISIBLES } from '../../data/visibles';
import { Ingredient } from '../../models/recette';
import { PLACARD, SelectionRestes } from '../../services/selection-restes';
import { normaliser } from '../../utils/texte';

/** Les restes que presque tout le monde a un jour : un geste suffit pour les cocher. */
const CLASSIQUES = [
  'pain-rassis',
  'bananes-mures',
  'epl-carotte',
  'fanes-carotte',
  'riz-cuit',
  'pates-cuites',
  'yaourt',
  'tomates-mures',
  'fruits-abimes',
  'legumes-fatigues',
  'fromage-bouts',
  'epl-pdt',
];

const RESTES = GROUPES_INGREDIENTS_VISIBLES.flatMap((g) => g.ingredients).filter(
  (i) => !PLACARD.has(i.id),
);
const PAR_ID = new Map(RESTES.map((i) => [i.id, i]));

/** Nombre de résultats montrés pendant une recherche. */
const MAX_RESULTATS = 8;

/**
 * « Qu'est-ce qui traîne dans ta cuisine ? » : on tape ou on touche ses restes,
 * puis on file vers les recettes. Le chemin le plus court vers une idée de plat.
 */
@Component({
  selector: 'app-choix-rapide',
  templateUrl: './choix-rapide.html',
  styleUrl: './choix-rapide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoixRapide {
  protected readonly selection = inject(SelectionRestes);
  private readonly router = inject(Router);

  protected readonly emoji = EMOJI_PAR_RESTE;
  protected readonly couleur = COULEUR_PAR_RESTE;
  protected readonly recherche = signal('');

  /** Les restes déjà cochés restent visibles en tête, puis la recherche ou les classiques. */
  protected readonly proposes = computed<Ingredient[]>(() => {
    const coches = this.selection
      .restesCoches()
      .map((id) => PAR_ID.get(id))
      .filter((i): i is Ingredient => !!i);
    const filtre = normaliser(this.recherche().trim());
    const autres = filtre
      ? RESTES.filter((i) => normaliser(i.nom).includes(filtre)).slice(0, MAX_RESULTATS)
      : CLASSIQUES.map((id) => PAR_ID.get(id)).filter((i): i is Ingredient => !!i);
    return [...coches, ...autres.filter((i) => !coches.includes(i))];
  });

  protected readonly nombreCoches = computed(() => this.selection.restesCoches().length);
  protected readonly nombreRecettes = computed(() => this.selection.recettes().length);

  protected estCoche(id: string): boolean {
    return !this.selection.estExemple() && this.selection.estCoche(id);
  }

  protected basculer(id: string): void {
    this.selection.basculerSansExemple(id);
  }

  protected voirRecettes(): void {
    this.selection.defilerVersRecettes.set(true);
    this.router.navigateByUrl('/restes');
  }
}
