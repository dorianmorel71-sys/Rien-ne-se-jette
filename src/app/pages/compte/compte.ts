import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { InvitationInstallation } from '../../components/invitation-installation/invitation-installation';
import { TitrePage } from '../../components/titre-page/titre-page';
import { PAGES, titreOnglet } from '../../pages-noms';
import { Compte, messageErreur } from '../../services/compte';
import { Compteur } from '../../services/compteur';
import { Favoris } from '../../services/favoris';
import { Foyer } from '../../services/foyer';
import { Frigo } from '../../services/frigo';

type Mode = 'connexion' | 'creation' | 'oubli';

@Component({
  selector: 'app-compte',
  imports: [NgTemplateOutlet, RouterLink, TitrePage, InvitationInstallation],
  templateUrl: './compte.html',
  styleUrl: './compte.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCompte {
  protected readonly page = PAGES.compte;

  constructor() {
    // L'onglet du navigateur porte le même nom que le titre et le menu.
    const titre = inject(Title);
    effect(() => titre.setTitle(titreOnglet(this.compte.nomAffiche() ?? 'Se connecter')));
  }
  protected readonly compte = inject(Compte);
  protected readonly favoris = inject(Favoris);
  protected readonly frigo = inject(Frigo);
  protected readonly compteur = inject(Compteur);
  protected readonly foyer = inject(Foyer);

  protected readonly mode = signal<Mode>('connexion');
  protected readonly nom = signal('');
  protected readonly email = signal('');
  protected readonly motDePasse = signal('');
  protected readonly voirMotDePasse = signal(false);

  protected readonly occupe = signal(false);
  protected readonly erreur = signal('');
  protected readonly info = signal('');
  /** Deuxième clic nécessaire pour quitter le foyer. */
  protected readonly confirmerDepart = signal(false);
  /** « Lien copié ! » après avoir copié l'invitation. */
  protected readonly lienCopie = signal(false);
  /** Deuxième clic nécessaire pour supprimer le compte. */
  protected readonly confirmerSuppression = signal(false);

  protected readonly titre = computed(
    () =>
      ({
        connexion: 'Se connecter',
        creation: 'Créer un compte',
        oubli: 'Mot de passe oublié',
      })[this.mode()],
  );

  /** « octobre 2026 ». */
  protected membreDepuis(creeLe?: string): string {
    const date = creeLe ? new Date(creeLe) : null;
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  protected changerMode(mode: Mode): void {
    this.mode.set(mode);
    this.erreur.set('');
    this.info.set('');
  }

  protected async valider(evenement: Event): Promise<void> {
    evenement.preventDefault();
    const email = this.email().trim();
    await this.executer(async () => {
      if (this.mode() === 'creation') {
        await this.compte.creerCompte(email, this.motDePasse(), this.nom().trim());
      } else if (this.mode() === 'connexion') {
        await this.compte.connecter(email, this.motDePasse());
      } else {
        await this.compte.envoyerReinitialisation(email);
        this.info.set(`Un e-mail pour changer ton mot de passe est parti à ${email}.`);
      }
      this.motDePasse.set('');
    });
  }

  protected google(): Promise<void> {
    return this.executer(() => this.compte.connecterAvecGoogle());
  }

  protected deconnecter(): Promise<void> {
    return this.executer(() => this.compte.deconnecter());
  }

  protected async supprimer(): Promise<void> {
    if (!this.confirmerSuppression()) {
      this.confirmerSuppression.set(true);
      return;
    }
    await this.executer(async () => {
      await this.foyer.quitter();
      await this.compte.supprimerCompte();
    });
    this.confirmerSuppression.set(false);
  }

  protected creerFoyer(): Promise<void> {
    return this.executer(() => this.foyer.creer());
  }

  /** Partage du téléphone si possible, sinon copie du lien. */
  protected async inviter(): Promise<void> {
    const url = this.foyer.lienInvitation();
    const texte = 'Rejoins mon frigo sur Rien ne se jette, pour savoir ce qu’il reste à finir.';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rien ne se jette', text: texte, url });
        return;
      } catch (e) {
        // Partage annulé par l'utilisateur : rien à faire.
        if ((e as Error).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      this.lienCopie.set(true);
      setTimeout(() => this.lienCopie.set(false), 3000);
    } catch {
      this.erreur.set(`Copie ce lien et envoie-le : ${url}`);
    }
  }

  protected async quitterFoyer(): Promise<void> {
    if (!this.confirmerDepart()) {
      this.confirmerDepart.set(true);
      return;
    }
    await this.executer(() => this.foyer.quitter());
    this.confirmerDepart.set(false);
  }

  private async executer(action: () => Promise<void>): Promise<void> {
    this.occupe.set(true);
    this.erreur.set('');
    this.info.set('');
    try {
      await action();
    } catch (e) {
      this.erreur.set(messageErreur(e));
    } finally {
      this.occupe.set(false);
    }
  }
}
