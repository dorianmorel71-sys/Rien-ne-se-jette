import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Compte } from '../../services/compte';
import { Compteur } from '../../services/compteur';
import { Favoris } from '../../services/favoris';

/**
 * Sans compte, tout s'efface à la fermeture de la page : on le dit dès qu'il y a
 * quelque chose à perdre, avec le chemin pour créer un compte.
 */
@Component({
  selector: 'app-rappel-compte',
  imports: [RouterLink],
  templateUrl: './rappel-compte.html',
  styleUrl: './rappel-compte.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RappelCompte {
  protected readonly compte = inject(Compte);
  private readonly compteur = inject(Compteur);
  private readonly favoris = inject(Favoris);

  /** Ce qui serait perdu, en clair : « tes 2 recettes gardées et tes 3 restes sauvés ». */
  protected readonly aPerdre = computed(() => {
    const gardes = this.favoris.recettes().length + this.favoris.legumes().length;
    const restes = this.compteur.restes();
    return [
      gardes ? `${gardes > 1 ? `tes ${gardes} favoris` : 'ton favori'}` : '',
      restes ? `${restes > 1 ? `tes ${restes} restes sauvés` : 'ton reste sauvé'}` : '',
    ]
      .filter(Boolean)
      .join(' et ');
  });

  protected readonly visible = computed(
    () => this.compte.actif && this.compte.pret() && !this.compte.utilisateur() && !!this.aPerdre(),
  );
}
