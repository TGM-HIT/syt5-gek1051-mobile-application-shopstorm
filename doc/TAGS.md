# Produkt-Tagging nach Geschäftsabteilungen
Diese Anwendung ermöglicht es Nutzern, Produkte in Einkaufslisten mit Tags zu kategorisieren, die sich an Abteilungen im Geschäft orientieren 
(z. B. „Obst & Gemüse“, „Kühlregal“ oder „Backwaren“). Dadurch können Einkäufe effizienter geplant, doppelte Wege vermieden und sichergestellt werden, dass alle benötigten Artikel in einem Durchgang erfasst werden.

## Flow
### Tag zu Produkt hinzufügen
- Der Nutzer öffnet eine Einkaufsliste und wählt ein Produkt aus.
- Über das "Deri-Punkte"-Symbol wählt der Nutzer "Rename aus".
- Er wählt die passenden Abteilungstags aus, z. B. „Obst & Gemüse“ für Äpfel.
- Der Nutzer drückt auf "Submit", wenn er zufrieden ist.
- Die Tags werden dem Produkt zugeordnet und in der Liste angezeigt.

## Key Concept
Diese Funktionalität ist in eine bestehende Einkaufslisten-App integriert und erweitert sie um eine dynamische Kategorisierungslogik. Die App besteht aus einer Single-Page-Webanwendung mit CSS und JavaScript, optional ergänzt durch Frameworks wie React.js für reaktive Updates.

Die App setzt auf **konsistente und standardisierte Kategorisierung**: Nutzer können ausschließlich vordefinierte Tags verwenden, die an typische Geschäftsabteilungen wie „Obst & Gemüse“, „Kühlregal“ oder „Backwaren“ angelehnt sind. Diese Tags sind sorgfältig kuratiert, um eine einheitliche Struktur zu gewährleisten und Dopplungen oder uneindeutige Bezeichnungen zu vermeiden. Dank dieser Vorgaben bleibt die Einkaufsplanung übersichtlich und effizient – ganz ohne Aufwand für die Nutzer.

Auch die **Tag-Verwaltung** profitiert von der Standardisierung: Da Tags nicht bearbeitet oder gelöscht werden können, bleibt die Datenintegrität gewahrt. Nutzer können sich darauf verlassen, dass alle Listen dieselben Abteilungskategorien verwenden – ideal für Haushalte oder Gruppen, die gemeinsam einkaufen.

Die **benutzerfreundliche Darstellung** unterstreicht dieses Konzept: Tags werden als einheitliche, farbcodierte Labels angezeigt, die sich nahtlos in die Liste einfügen. Beim Filtern orientiert sich die Sortierung strikt an der typischen Abteilungsabfolge im Supermarkt, um den Einkauf reibungslos zu gestalten.

## Implementation

### Übersicht

```{Javascript}
const AVAILABLE_TAGS = [
  { id: 'fruits_vegetables', label: 'Obst & Gemüse' },
  { id: 'fresh_counter', label: 'Frischetheke' },
  { id: 'dairy_cooling', label: 'Molkerei & Kühlprodukte' },
  { id: 'frozen_food', label: 'Tiefkühlprodukte' },
  { id: 'dry_goods', label: 'Trockenwaren' },
  { id: 'beverages', label: 'Getränke' },
  { id: 'sweets_snacks', label: 'Süßwaren & Snacks' },
  { id: 'non_food', label: 'Non-Food' }
];
```

AVAILABLE_TAGS ist eine vordefinierte Liste von Produktkategorien, die zur Klassifizierung und Organisation von Artikeln in einer Anwendung (z. B. einem Supermarkt-Inventarsystem) verwendet wird. Jede Kategorie enthält eine technische ID und ein deutschsprachiges Label für die Darstellung in der Benutzeroberfläche.
Struktur der Tag-Objekte

Jeder Eintrag in der Liste ist ein Objekt mit folgender Struktur:

  - id (String):
  Ein eindeutiger maschinenlesbarer Identifier in snake_case.
  Beispiel: fruits_vegetables, dairy_cooling

  - label (String):
  Ein menschenlesbarer Anzeigename in deutscher Sprache.
  Beispiel: Obst & Gemüse, Molkerei & Kühlprodukte

### Bestandteile und Funktionen

#### **`<FormControl fullWidth>`**
- Stellt sicher, dass das Dropdown-Menü die volle Breite des übergeordneten Containers einnimmt.

#### **`<InputLabel>Kategorie</InputLabel>`**
- Zeigt das Label "Kategorie" über dem Dropdown-Menü an.

#### **`<Select>`**
- Die Komponente für das Dropdown-Menü.
- `data-cy="category-select"` dient zur Testautomatisierung, um das Element gezielt ansprechen zu können.
- `value={selectedTag}` setzt den aktuell ausgewählten Wert.
- `onChange={this.handleTagChange}` gibt eine Handler-Funktion an, die auf Änderungen reagiert.
- `label="Kategorie"` verknüpft das Label mit dem Select-Element.

#### **`AVAILABLE_TAGS.map((tag) => ...)`**
- Erstellt dynamisch eine Liste von `MenuItem`-Elementen basierend auf den in `AVAILABLE_TAGS` gespeicherten Kategorien.
- Jedes `MenuItem` verwendet `key={tag.id}`, um eine eindeutige Identifikation zu gewährleisten.
- `data-cy={`category-option-${tag.label}`}` fügt eine Test-ID für jedes Element hinzu.
- `{tag.label}` zeigt den Namen der jeweiligen Kategorie an.

## Ressourcen
https://www.deepl.com/
https://github.com/TGM-HIT/syt5-gek1051-mobile-application-shopstorm/blob/main/src/components/ShoppingList.js
