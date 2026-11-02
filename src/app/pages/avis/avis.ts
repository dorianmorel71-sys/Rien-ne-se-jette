import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitrePage } from '../../components/titre-page/titre-page';
import { PAGES } from '../../pages-noms';
import { Avis, Humeur, LONGUEUR_TEXTE } from '../../services/avis';
import { Compte, messageErreur } from '../../services/compte';

/** Formulaire d'avis des testeurs : #/avis?depuis=/restes. */
@Component({
  selector: 'app-avis',
  imports: [RouterLink, TitrePage],
  templateUrl: './avis.html',
  styleUrl: './avis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAvis {
  protected readonly page = PAGES.avis;
  protected readonly compte = inject(Compte);
  private readonly avis = inject(Avis);

  /** Page d'où l'on vient, passée par le lien « Ton avis ». */
  readonly depuis = input<string>();

  protected readonly humeurs: { valeur: Humeur; emoji: string; libelle: string }[] = [
    { valeur: 'adore', emoji: '😍', libelle: 'J’adore' },
    { valeur: 'bien', emoji: '🙂', libelle: 'C’est bien' },
    { valeur: 'bof', emoji: '😕', libelle: 'Bof' },
    { valeur: 'bug', emoji: '🐞', libelle: 'Un bug' },
  ];
  protected readonly longueurMax = LONGUEUR_TEXTE;

  protected readonly humeur = signal<Humeur | null>(null);
  protected readonly texte = signal('');
  protected readonly email = signal('');

  protected readonly occupe = signal(false);
  protected readonly erreur = signal('');
  protected readonly envoye = signal(false);

  protected choisirHumeur(humeur: Humeur): void {
    this.humeur.set(this.humeur() === humeur ? null : humeur);
  }

  protected async envoyer(evenement: Event): Promise<void> {
    evenement.preventDefault();
    if (!this.texte().trim() || this.occupe()) return;
    this.occupe.set(true);
    this.erreur.set('');
    try {
      await this.avis.envoyer({
        texte: this.texte(),
        humeur: this.humeur(),
        // Connecté : on a déjà l'adresse, rattachée au compte.
        email: this.compte.utilisateur()?.email ?? this.email(),
        page: this.depuis() ?? '',
      });
      this.envoye.set(true);
    } catch (e) {
      this.erreur.set(messageErreur(e));
    } finally {
      this.occupe.set(false);
    }
  }

  protected recommencer(): void {
    this.texte.set('');
    this.humeur.set(null);
    this.envoye.set(false);
  }
}
