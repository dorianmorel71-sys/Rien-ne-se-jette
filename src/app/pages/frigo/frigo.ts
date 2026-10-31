import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarteRecette } from '../../components/carte-recette/carte-recette';
import { TitrePage } from '../../components/titre-page/titre-page';
import { Compte } from '../../services/compte';
import { Foyer } from '../../services/foyer';
import { Frigo as ServiceFrigo, RESTES_FRIGO, ResteAuFrigo } from '../../services/frigo';
import { enumerer } from '../../services/generer-recette';
import { Messages } from '../../services/messages';
import { SelectionRestes } from '../../services/selection-restes';
import { PAGES } from '../../pages-noms';
import { suggererRecettes } from '../../services/suggestions';
import { ajouterJours, aujourdhui, libelleDate } from '../../utils/date';
import { normaliser } from '../../utils/texte';

type Filtre = 'tout' | 'urgents' | 'frigo' | 'congelateur';

/** Nombre maximum de suggestions sous la recherche. */
const SUGGESTIONS_MAX = 12;
/** Recettes proposées pour ce soir : 3 visibles, jusqu'à 10 en tout. */
const IDEES_VISIBLES = 3;
const IDEES_MAX = 10;

@Component({
  selector: 'app-frigo',
  imports: [CarteRecette, LowerCasePipe, RouterLink, TitrePage],
  templateUrl: './frigo.html',
  styleUrl: './frigo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFrigo {
  protected readonly frigo = inject(ServiceFrigo);
  protected readonly compte = inject(Compte);
  protected readonly foyer = inject(Foyer);
  private readonly selection = inject(SelectionRestes);
  private readonly messages = inject(Messages);
  protected readonly page = PAGES.frigo;

  /** « Léa », « Léa et Sam ». */
  protected readonly partageAvec = computed(() => enumerer(this.foyer.autres().map((m) => m.nom)));
  private readonly router = inject(Router);

  protected readonly recherche = signal('');
  /** Jour où les restes ajoutés ont été rangés : aujourd'hui sauf si on l'a oublié. */
  protected readonly dateRangement = signal(this.frigo.jour());
  protected readonly versCongelateur = signal(false);
  /** Filtre de la liste. */
  protected readonly filtre = signal<Filtre>('tout');
  protected readonly filtres = computed(() => {
    const auFrigo = this.frigo.auFrigo();
    const auCongelateur = this.frigo.auCongelateur();
    return [
      { valeur: 'tout' as const, libelle: 'Tout', nombre: auFrigo.length + auCongelateur.length },
      { valeur: 'urgents' as const, libelle: '⏰ À finir vite', nombre: this.frigo.urgents() },
      { valeur: 'frigo' as const, libelle: '🧊 Frigo', nombre: auFrigo.length },
      { valeur: 'congelateur' as const, libelle: '❄️ Congélateur', nombre: auCongelateur.length },
    ];
  });
  /** Frigo puis congélateur, selon le filtre. */
  protected readonly zones = computed(() => {
    const filtre = this.filtre();
    const auFrigo = this.frigo.auFrigo();
    return [
      filtre === 'congelateur'
        ? []
        : filtre === 'urgents'
          ? auFrigo.filter((r) => r.joursRestants <= 1)
          : auFrigo,
      filtre === 'tout' || filtre === 'congelateur' ? this.frigo.auCongelateur() : [],
    ];
  });

  /** Reste dont on modifie la date ou la note. */
  protected readonly enModification = signal<string | null>(null);

  protected readonly joursRapides = computed(() => {
    const jour = this.frigo.jour();
    return [
      { date: jour, libelle: "Aujourd'hui" },
      { date: ajouterJours(jour, -1), libelle: 'Hier' },
      { date: ajouterJours(jour, -2), libelle: 'Avant-hier' },
    ];
  });
  /** Vrai quand la date choisie n'est pas un des boutons rapides. */
  protected readonly autreDate = computed(
    () => !this.joursRapides().some((j) => j.date === this.dateRangement()),
  );

  /** Restes qui correspondent à la recherche et ne sont pas déjà au frigo. */
  protected readonly resultats = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    if (!filtre) return [];
    return RESTES_FRIGO.filter(
      (i) => normaliser(i.nom).includes(filtre) && !this.frigo.contient(i.id),
    ).slice(0, SUGGESTIONS_MAX);
  });

  /** On propose d'écrire son propre reste, sauf s'il porte exactement le nom d'un reste connu. */
  protected readonly proposerLibre = computed(() => {
    const texte = normaliser(this.recherche().trim());
    return texte.length >= 2 && !RESTES_FRIGO.some((i) => normaliser(i.nom) === texte);
  });

  /** « Qu'est-ce que je cuisine ce soir ? » : les recettes qui sauvent le plus de restes urgents. */
  protected readonly suggestions = computed(() => suggererRecettes(this.frigo.restes(), IDEES_MAX));
  /** Les 3 premières ; les autres en touchant « Voir … autres idées ». */
  protected readonly toutesIdees = signal(false);
  protected readonly suggestionsVisibles = computed(() =>
    this.toutesIdees() ? this.suggestions() : this.suggestions().slice(0, IDEES_VISIBLES),
  );
  /** Ce qu'on voit quand la liste est fermée : « Omelette, Gratin et 3 autres ». */
  protected readonly apercuSuggestions = computed(() => {
    const noms = this.suggestions().map((s) => s.recette.nom);
    const autres = noms.length - 2;
    return autres > 0 ? `${noms.slice(0, 2).join(', ')} et ${autres} autres` : noms.join(' et ');
  });
  /** Suggestion dont on a déplié la recette. */
  protected readonly suggestionOuverte = signal<string | null>(null);

  protected basculerSuggestion(nom: string): void {
    this.suggestionOuverte.update((actuelle) => (actuelle === nom ? null : nom));
  }

  /** Restes de la liste au frigo, pour lesquels on a des recettes. */
  private readonly avecRecettes = computed(() => this.frigo.auFrigo().filter((r) => !r.libre));
  protected readonly peutChercherRecettes = computed(() => this.avecRecettes().length > 0);

  constructor() {
    // L'appli a pu rester ouverte depuis la veille.
    this.frigo.jour.set(aujourdhui());
    this.dateRangement.set(this.frigo.jour());
  }

  private get options() {
    return { depuis: this.dateRangement(), congele: this.versCongelateur() };
  }

  protected ranger(id: string): void {
    this.frigo.ranger([id], this.options);
    this.annoncerAjout(id);
  }

  protected rangerLibre(): void {
    const avant = new Set(this.frigo.etat().map((r) => r.id));
    this.frigo.rangerLibre(this.recherche(), this.options);
    const nouveau = this.frigo.etat().find((r) => !avant.has(r.id));
    if (nouveau) this.annoncerAjout(nouveau.id);
  }

  private annoncerAjout(id: string): void {
    const nom = this.frigo.restes().find((r) => r.id === id)?.ingredient.nom ?? 'Reste';
    this.recherche.set('');
    this.messages.afficher(
      `✓ ${nom} : ${this.versCongelateur() ? 'au congélateur' : 'au frigo'}`,
      () => this.frigo.retirer([id]),
    );
  }

  /** Date tapée dans le calendrier : jamais dans le futur. */
  protected choisirDate(valeur: string, id?: string): void {
    if (!valeur || valeur > this.frigo.jour()) return;
    if (id) this.frigo.modifier(id, { depuis: valeur });
    else this.dateRangement.set(valeur);
  }

  protected vider(): void {
    const avant = this.frigo.vider();
    this.messages.afficher('Frigo vidé', () => this.frigo.remettre(avant));
  }

  protected utilise(r: ResteAuFrigo): void {
    const retires = this.frigo.retirer([r.id]);
    this.enModification.set(null);
    this.messages.afficher(`✓ ${r.ingredient.nom} : retiré`, () => this.frigo.remettre(retires));
  }

  protected congeler(r: ResteAuFrigo): void {
    const avant = this.frigo.rangement(r.id);
    this.frigo.congeler(r.id);
    this.enModification.set(null);
    this.messages.afficher(`❄️ ${r.ingredient.nom} : au congélateur`, () =>
      avant ? this.frigo.remettre([avant]) : undefined,
    );
  }

  protected decongeler(r: ResteAuFrigo): void {
    const avant = this.frigo.rangement(r.id);
    this.frigo.decongeler(r.id);
    this.enModification.set(null);
    this.messages.afficher(`${r.ingredient.nom} : à finir dans les 24 h`, () =>
      avant ? this.frigo.remettre([avant]) : undefined,
    );
  }

  protected basculerModification(id: string): void {
    this.enModification.update((actuel) => (actuel === id ? null : id));
  }

  protected echeance(r: ResteAuFrigo): string {
    if (r.joursRestants < 0) return 'Date passée';
    if (r.joursRestants === 0) return "À finir aujourd'hui";
    if (r.joursRestants === 1) return 'À finir demain';
    if (r.joursRestants >= 60) return `Encore ${Math.floor(r.joursRestants / 30)} mois`;
    return `Encore ${r.joursRestants} jours`;
  }

  protected etat(r: ResteAuFrigo): 'passe' | 'urgent' | 'bientot' | 'ok' | 'congele' {
    if (r.joursRestants < 0) return 'passe';
    if (r.congele) return 'congele';
    if (r.joursRestants <= 1) return 'urgent';
    if (r.joursRestants <= 3) return 'bientot';
    return 'ok';
  }

  /** « aujourd'hui », « hier » ou « le lundi 26 octobre ». */
  protected quand(date: string): string {
    const [aujourdhuiJ, hier] = this.joursRapides();
    if (date === aujourdhuiJ.date) return "aujourd'hui";
    if (date === hier.date) return 'hier';
    return `le ${libelleDate(date)}`;
  }

  protected readonly libelleDate = libelleDate;

  /** Coche le frigo (hors congélateur et restes libres) dans « Mes restes » et montre les recettes. */
  protected voirRecettes(): void {
    this.selection.ajouter(this.avecRecettes().map((r) => r.id));
    this.selection.defilerVersRecettes.set(true);
    this.router.navigate(['/restes']);
  }
}
