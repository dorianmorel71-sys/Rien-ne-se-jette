import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Frigo as ServiceFrigo, RESTES_FRIGO, ResteAuFrigo } from '../../services/frigo';
import { SelectionRestes } from '../../services/selection-restes';
import { aujourdhui, libelleDate } from '../../utils/date';
import { normaliser } from '../../utils/texte';

/** Nombre maximum de suggestions sous la recherche. */
const SUGGESTIONS_MAX = 12;

@Component({
  selector: 'app-frigo',
  templateUrl: './frigo.html',
  styleUrl: './frigo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFrigo {
  protected readonly frigo = inject(ServiceFrigo);
  private readonly selection = inject(SelectionRestes);
  private readonly router = inject(Router);

  protected readonly recherche = signal('');

  /** Restes qui correspondent à la recherche et ne sont pas déjà au frigo. */
  protected readonly suggestions = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    if (!filtre) return [];
    return RESTES_FRIGO.filter(
      (i) => normaliser(i.nom).includes(filtre) && !this.frigo.contient(i.id),
    ).slice(0, SUGGESTIONS_MAX);
  });

  constructor() {
    // L'appli a pu rester ouverte depuis la veille.
    this.frigo.jour.set(aujourdhui());
  }

  protected ranger(id: string): void {
    this.frigo.ranger([id]);
    this.recherche.set('');
  }

  protected echeance(r: ResteAuFrigo): string {
    if (r.joursRestants < 0) return 'Date passée';
    if (r.joursRestants === 0) return "À finir aujourd'hui";
    if (r.joursRestants === 1) return 'À finir demain';
    return `Encore ${r.joursRestants} jours`;
  }

  protected etat(r: ResteAuFrigo): 'passe' | 'urgent' | 'bientot' | 'ok' {
    if (r.joursRestants < 0) return 'passe';
    if (r.joursRestants <= 1) return 'urgent';
    if (r.joursRestants <= 3) return 'bientot';
    return 'ok';
  }

  protected readonly libelleDate = libelleDate;

  /** Coche tout le frigo dans « Mes restes » et montre les recettes. */
  protected voirRecettes(): void {
    this.selection.ajouter(this.frigo.restes().map((r) => r.ingredient.id));
    this.selection.defilerVersRecettes.set(true);
    this.router.navigate(['/restes']);
  }
}
