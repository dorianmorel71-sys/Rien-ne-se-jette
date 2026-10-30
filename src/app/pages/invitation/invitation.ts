import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Compte, messageErreur } from '../../services/compte';
import { Foyer } from '../../services/foyer';

/** Ouverte depuis un lien d'invitation : #/foyer/:id. */
@Component({
  selector: 'app-invitation',
  imports: [RouterLink],
  templateUrl: './invitation.html',
  styleUrl: './invitation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageInvitation {
  protected readonly compte = inject(Compte);
  protected readonly foyer = inject(Foyer);
  private readonly router = inject(Router);

  /** Identifiant du foyer, lu dans l'URL. */
  readonly id = input.required<string>();

  protected readonly occupe = signal(false);
  protected readonly erreur = signal('');

  constructor() {
    // Gardée pour après la connexion, si on n'a pas encore de compte.
    effect(() => {
      if (this.compte.pret() && !this.compte.utilisateur()) this.foyer.garderInvitation(this.id());
    });
  }

  protected async rejoindre(): Promise<void> {
    this.occupe.set(true);
    this.erreur.set('');
    try {
      await this.foyer.rejoindre(this.id());
      this.router.navigate(['/frigo']);
    } catch (e) {
      this.erreur.set(messageErreur(e));
    } finally {
      this.occupe.set(false);
    }
  }
}
