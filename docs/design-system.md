# Kura — Design System

Guida di stile per l'applicazione Kura, libretto sanitario digitale personale self-hosted (PocketBase + React). Questo documento è pensato per essere dato a un agente di sviluppo: ogni scelta visiva dell'app deve derivare dai token e dalle regole qui definiti. In caso di dubbio, l'icona è la fonte di verità: verde smeraldo, forme arrotondate, tratti morbidi, e il tracciato ECG come elemento firma.

---

## 1. Identità e principi

**Personalità:** calma, affidabile, personale. Kura custodisce dati sanitari: l'interfaccia deve trasmettere ordine e sicurezza, mai urgenza ospedaliera. Niente rosso come colore dominante, niente iconografia da pronto soccorso.

**Tre principi operativi:**

1. **Morbido ma preciso.** Angoli generosamente arrotondati e tratti con terminazioni tonde (come nel logo), ma griglie, allineamenti e gerarchie tipografiche rigorosi. I dati medici sono seri; la cornice è accogliente.
2. **Il verde è guida, non tappezzeria.** Il verde smeraldo indica azioni primarie, stati attivi e il brand. Le superfici restano neutre e chiare: un documento sanitario deve essere leggibile prima che decorato.
3. **L'ECG è la firma.** Il tracciato del logo ricompare con parsimonia come elemento distintivo: loading indicator, divisore decorativo negli empty state, dettaglio nell'header. Massimo un'occorrenza per schermata.

---

## 2. Colori

### 2.1 Palette brand (dal logo)

| Token | Hex | Uso |
|---|---|---|
| `--kura-50` | `#ECFDF5` | Sfondi tinta, hover su elementi verdi chiari |
| `--kura-100` | `#D1FAE5` | Badge, chip, sfondi di stato attivo |
| `--kura-200` | `#A7F3D0` | Bordi di elementi selezionati |
| `--kura-300` | `#6EE7B7` | **Accento menta** (l'ECG del logo): grafici, dettagli su sfondi scuri |
| `--kura-400` | `#34D399` | Icone decorative, indicatori |
| `--kura-500` | `#10B981` | Grafici, progress bar |
| `--kura-600` | `#059669` | **Primario**: bottoni, link, focus ring |
| `--kura-700` | `#047857` | Hover del primario, testo verde su chiaro |
| `--kura-800` | `#065F46` | Active/pressed, testo verde ad alto contrasto |
| `--kura-900` | `#064E3B` | Sfondi scuri brand (sidebar dark, hero) |

Il gradiente brand (solo per icona, splash, hero della sidebar): `linear-gradient(135deg, #059669, #047857)`.

### 2.2 Neutri (grigi con sottotono verde freddo)

| Token | Hex | Uso |
|---|---|---|
| `--neutral-0` | `#FFFFFF` | Superfici card |
| `--neutral-50` | `#F6F8F7` | Sfondo app (body) |
| `--neutral-100` | `#EDF1EF` | Sfondi secondari, righe alternate tabelle |
| `--neutral-200` | `#DCE3E0` | Bordi, divisori |
| `--neutral-400` | `#94A3A0` | Testo placeholder, icone disabilitate |
| `--neutral-500` | `#64756F` | Testo secondario, label, metadati |
| `--neutral-700` | `#3D4A45` | Testo di supporto |
| `--neutral-900` | `#17211D` | Testo principale, titoli |

### 2.3 Semantici

| Token | Hex | Uso |
|---|---|---|
| `--success` | `#059669` | Coincide con il primario: conferme, upload riusciti |
| `--warning` | `#D97706` | Scadenze in arrivo (es. richiami vaccinali), attenzione |
| `--danger` | `#DC2626` | Solo errori ed eliminazioni. Mai per contenuti medici |
| `--info` | `#0284C7` | Note informative, suggerimenti |

Ogni semantico ha una variante superficie al 10% circa: `--warning-bg: #FEF3E2`, `--danger-bg: #FDECEC`, `--info-bg: #E8F4FB`, `--success-bg: var(--kura-50)`.

### 2.4 Colori per categoria di documento

Per distinguere a colpo d'occhio i tipi di documento sanitario (badge e icone, mai testi lunghi):

| Categoria | Colore badge | Sfondo badge |
|---|---|---|
| Referti / analisi | `#047857` | `#D1FAE5` |
| Prescrizioni / farmaci | `#7C3AED` | `#EDE9FE` |
| Vaccinazioni | `#0284C7` | `#E0F2FE` |
| Visite / specialisti | `#D97706` | `#FEF3E2` |
| Imaging (RX, RMN, eco) | `#475569` | `#E2E8F0` |
| Altro | `#64756F` | `#EDF1EF` |

### 2.5 Dark mode

Il dark mode ribalta le superfici mantenendo il verde riconoscibile. Sfondo app `#0E1613` (verde-nero, non nero puro), card `#16211C`, bordi `#25332D`, testo principale `#E8EFEB`, testo secondario `#8FA39B`. Il primario diventa `--kura-400` (#34D399) per i bottoni e `--kura-300` (#6EE7B7) per link e accenti, perché su scuro il 600 non ha contrasto sufficiente.

---

## 3. Tipografia

Tre ruoli, tre famiglie (tutte su Google Fonts, self-hostabili con `@fontsource/*` per coerenza con la filosofia self-hosted del progetto):

| Ruolo | Font | Fallback | Uso |
|---|---|---|---|
| Display | **Outfit** | system-ui, sans-serif | Titoli pagina, numeri grandi in dashboard, logo testuale |
| Body | **Inter** | system-ui, sans-serif | Tutto il resto: paragrafi, form, navigazione |
| Dati | **JetBrains Mono** | monospace | Valori clinici, dosaggi, codici fiscali/tessera, date nei metadati |

Il mono per i valori clinici è una scelta deliberata: "Glicemia **92 mg/dL**" con il valore in JetBrains Mono rende i numeri scansionabili e dà all'app un carattere da "cartella dati" preciso.

### Scala tipografica

| Token | Size / line-height | Peso | Uso |
|---|---|---|---|
| `--text-display` | 32px / 38px | Outfit 600 | Titolo pagina (uno per schermata) |
| `--text-title` | 24px / 30px | Outfit 600 | Titoli sezione, titoli modali |
| `--text-heading` | 18px / 26px | Inter 600 | Titoli card, titoli documento |
| `--text-body` | 15px / 23px | Inter 400 | Testo base |
| `--text-body-strong` | 15px / 23px | Inter 600 | Enfasi, label form |
| `--text-small` | 13px / 19px | Inter 400 | Metadati, didascalie, helper text |
| `--text-mono` | 14px / 20px | JetBrains Mono 500 | Valori e codici |

Regole: sentence case ovunque (mai TUTTO MAIUSCOLO tranne micro-label da 11px con letter-spacing 0.06em per le eyebrow di sezione). Numeri tabellari (`font-variant-numeric: tabular-nums`) in ogni tabella e lista di valori.

---

## 4. Forma, spaziatura, elevazione

### 4.1 Raggi (derivati dal ~22% dell'icona)

| Token | Valore | Uso |
|---|---|---|
| `--radius-sm` | 8px | Chip, badge, tag |
| `--radius-md` | 12px | Bottoni, input, select |
| `--radius-lg` | 16px | Card, modali, dropdown |
| `--radius-xl` | 24px | Contenitori hero, immagini di anteprima grandi |
| `--radius-full` | 9999px | Avatar, pill, toggle |

Mai angoli vivi (0px): tradirebbero il linguaggio del logo.

### 4.2 Spaziatura

Scala base 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Padding card: 20px (24px su desktop largo). Gap tra card in griglia: 16px. Margine tra sezioni di pagina: 40px. Container principale: max-width 1120px, padding laterale 24px (16px su mobile).

### 4.3 Ombre (tinte di verde, mai grigio-blu)

```css
--shadow-sm: 0 1px 2px rgba(6, 78, 59, 0.06);
--shadow-md: 0 4px 12px rgba(6, 78, 59, 0.08);
--shadow-lg: 0 12px 32px rgba(6, 78, 59, 0.12);
```

Le card a riposo usano `--shadow-sm` + bordo `--neutral-200`; al hover (solo se cliccabili) passano a `--shadow-md` con transizione 150ms.

### 4.4 Motion

Transizioni brevi e discrete: 150ms `ease-out` per hover/focus, 220ms `cubic-bezier(0.2, 0.8, 0.2, 1)` per modali e drawer. Rispettare sempre `prefers-reduced-motion: reduce` disattivando animazioni non essenziali. L'unica animazione "di carattere" concessa: il tracciato ECG che si disegna (stroke-dashoffset) come loading indicator.

---

## 5. Componenti

### 5.1 Bottoni

Altezza 40px (36px compact), padding orizzontale 16px, radius `--radius-md`, font Inter 600 15px, icona opzionale 18px a sinistra con gap 8px.

| Variante | Riposo | Hover | Active |
|---|---|---|---|
| Primario | bg `--kura-600`, testo bianco | bg `--kura-700` | bg `--kura-800` |
| Secondario | bg bianco, bordo `--neutral-200`, testo `--neutral-900` | bg `--neutral-50` | bg `--neutral-100` |
| Ghost | trasparente, testo `--kura-700` | bg `--kura-50` | bg `--kura-100` |
| Distruttivo | bg bianco, bordo e testo `--danger` | bg `--danger-bg` | — |

Un solo bottone primario per vista. Le eliminazioni richiedono sempre conferma in modale.

### 5.2 Card documento (componente centrale dell'app)

Struttura: icona categoria in un quadrato 40px con radius 12px e i colori della categoria (§2.4) → titolo documento in `--text-heading` → riga metadati in `--text-small` colore `--neutral-500` (data in mono · medico/struttura · dimensione file) → badge categoria in alto a destra. Bordo sinistro NON colorato (niente accent-border: troppo "ticket system"); la categoria parla attraverso icona e badge.

### 5.3 Form e input

Input: altezza 40px, bg bianco, bordo `--neutral-200`, radius `--radius-md`, padding 12px. Focus: bordo `--kura-600` + ring `0 0 0 3px rgba(5, 150, 105, 0.15)`. Errore: bordo `--danger` + helper text sotto in `--danger`, mai solo il colore (aggiungere icona o testo). Label sopra l'input in `--text-body-strong`, helper text sotto in `--text-small`. Upload file: dropzone con bordo tratteggiato `--neutral-200` radius `--radius-lg`, al drag-over bordo `--kura-600` e bg `--kura-50`.

### 5.4 Navigazione

Sidebar desktop (240px) su bg `--neutral-0` con bordo destro; voce attiva: bg `--kura-50`, testo `--kura-800`, icona `--kura-600`, radius `--radius-md`. In alto il logo Kura (icona 32px + wordmark "Kura" in Outfit 600). Su mobile: bottom bar a 4-5 voci, icona 24px + label 11px, voce attiva in `--kura-600`.

### 5.5 Badge, stati e feedback

Badge: pill radius, padding 4px 10px, testo 12px/600, colori da §2.4 o semantici. Toast: card `--radius-lg` con icona semantica, auto-dismiss 4s, posizione bottom-center su mobile e bottom-right su desktop. Empty state: illustrazione minimale con il tratto ECG in `--kura-300`, titolo in `--text-heading`, una riga di spiegazione e un bottone primario che invita all'azione ("Carica il primo documento").

### 5.6 Tabelle e liste valori

Header in `--text-small` 600 maiuscoletto `--neutral-500`; righe con divisori `--neutral-200`, hover `--neutral-50`; valori numerici in JetBrains Mono allineati a destra. Su mobile le tabelle collassano in card.

---

## 6. Iconografia e asset

Set icone: **Lucide** (già coerente con React), stroke-width 2, terminazioni tonde — lo stesso linguaggio del logo. Dimensioni: 18px inline, 20px nei bottoni, 24px in navigazione. Colore di default `--neutral-500`, attive/brand in `--kura-600`. Vietato mixare set di icone diversi.

Il file `kura-icon.svg` è l'icona ufficiale (favicon, PWA, app icon). Il tracciato ECG estraibile dal logo per usi decorativi è il path: `M0 40 L86 120 H132 L162 44 L196 176 L226 120 H290` (stroke round, width proporzionale).

---

## 7. Accessibilità (non negoziabile)

Contrasto minimo WCAG AA: testo normale 4.5:1, testo grande 3:1 — per questo il testo verde su bianco usa `--kura-700`/`--kura-800`, mai 400/500. Focus visibile su ogni elemento interattivo (ring verde §5.3, mai `outline: none` senza sostituto). Tutte le azioni raggiungibili da tastiera; modali con focus trap ed `Esc` per chiudere. Le informazioni non sono mai veicolate dal solo colore (badge = colore + testo). Target touch minimo 44×44px su mobile. `lang="it"` sul documento e testi alternativi su ogni anteprima di documento.

---

## 8. Token CSS pronti all'uso

```css
:root {
  /* Brand */
  --kura-50:#ECFDF5; --kura-100:#D1FAE5; --kura-200:#A7F3D0;
  --kura-300:#6EE7B7; --kura-400:#34D399; --kura-500:#10B981;
  --kura-600:#059669; --kura-700:#047857; --kura-800:#065F46; --kura-900:#064E3B;

  /* Neutri */
  --neutral-0:#FFFFFF; --neutral-50:#F6F8F7; --neutral-100:#EDF1EF;
  --neutral-200:#DCE3E0; --neutral-400:#94A3A0; --neutral-500:#64756F;
  --neutral-700:#3D4A45; --neutral-900:#17211D;

  /* Semantici */
  --success:#059669; --success-bg:#ECFDF5;
  --warning:#D97706; --warning-bg:#FEF3E2;
  --danger:#DC2626;  --danger-bg:#FDECEC;
  --info:#0284C7;    --info-bg:#E8F4FB;

  /* Superfici e testo */
  --bg-app:var(--neutral-50); --bg-card:var(--neutral-0);
  --border:var(--neutral-200);
  --text-primary:var(--neutral-900); --text-secondary:var(--neutral-500);
  --brand:var(--kura-600); --brand-hover:var(--kura-700); --brand-active:var(--kura-800);

  /* Forma */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px; --radius-full:9999px;

  /* Ombre */
  --shadow-sm:0 1px 2px rgba(6,78,59,.06);
  --shadow-md:0 4px 12px rgba(6,78,59,.08);
  --shadow-lg:0 12px 32px rgba(6,78,59,.12);

  /* Font */
  --font-display:'Outfit',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;

  /* Motion */
  --ease-out:ease-out; --ease-spring:cubic-bezier(.2,.8,.2,1);
  --dur-fast:150ms; --dur-med:220ms;
}

[data-theme="dark"] {
  --bg-app:#0E1613; --bg-card:#16211C; --border:#25332D;
  --text-primary:#E8EFEB; --text-secondary:#8FA39B;
  --brand:var(--kura-400); --brand-hover:var(--kura-300); --brand-active:var(--kura-500);
  --shadow-sm:none; --shadow-md:0 4px 12px rgba(0,0,0,.4); --shadow-lg:0 12px 32px rgba(0,0,0,.5);
}
```

### Estensione Tailwind equivalente (se il progetto usa Tailwind)

```js
// tailwind.config.js — theme.extend
colors: {
  kura: { 50:'#ECFDF5',100:'#D1FAE5',200:'#A7F3D0',300:'#6EE7B7',400:'#34D399',
          500:'#10B981',600:'#059669',700:'#047857',800:'#065F46',900:'#064E3B' },
  neutral: { 0:'#FFFFFF',50:'#F6F8F7',100:'#EDF1EF',200:'#DCE3E0',
             400:'#94A3A0',500:'#64756F',700:'#3D4A45',900:'#17211D' },
},
borderRadius: { sm:'8px', md:'12px', lg:'16px', xl:'24px' },
fontFamily: {
  display:['Outfit','system-ui','sans-serif'],
  sans:['Inter','system-ui','sans-serif'],
  mono:['JetBrains Mono','monospace'],
},
boxShadow: {
  sm:'0 1px 2px rgba(6,78,59,.06)',
  md:'0 4px 12px rgba(6,78,59,.08)',
  lg:'0 12px 32px rgba(6,78,59,.12)',
},
```

---

## 9. Regole rapide per l'agente (checklist)

1. Ogni colore, raggio, ombra e font proviene dai token di §8: nessun valore hardcoded nei componenti.
2. Un solo bottone primario verde per vista; il rosso appare solo per errori ed eliminazioni.
3. Valori clinici, dosaggi e codici sempre in JetBrains Mono con `tabular-nums`.
4. Card e superfici bianche su sfondo `--bg-app`, mai bianco su bianco senza bordo.
5. Angoli sempre arrotondati secondo la scala; icone solo Lucide, stroke 2, terminazioni tonde.
6. Il motivo ECG appare al massimo una volta per schermata (loading, empty state o header, non tutti insieme).
7. Focus ring verde visibile ovunque; contrasto AA verificato; target touch ≥ 44px.
8. Dark mode via `[data-theme="dark"]`: usare solo i token semantici (`--bg-card`, `--text-primary`, `--brand`…), mai i valori grezzi della scala, così il tema si ribalta gratis.
9. Sentence case in tutta la UI; le date in formato `GG mmm AAAA` (es. `12 lug 2026`) nei metadati.
10. Prima di introdurre un componente nuovo, verificare che non sia componibile da quelli di §5.