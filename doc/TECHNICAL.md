# Technische Dokumentation

## Projektinformationen

- **Name**: `shopping-list-react-pouchdb`
- **Version**: `0.1.0`

## Dependencies

Es werden react und pouchdb verwendet. Das `package.json` file hat eine Vollständige Liste der dependencies unter der section `"dependencies"`.

### Scripts

Das Projekt enthält folgende Scripts:

- **start**: Startet die Entwicklungsumgebung mit `react-scripts start`.
- **build**: Erstellt eine Produktionsversion mit `react-scripts build`.
- **test**: Führt Tests aus, indem es `react-scripts test` mit der Umgebung `jsdom` verwendet.
- **predeploy**: Führt vor dem Deployen den Build-Prozess aus.
- **deploy**: Deployt die Anwendung auf GitHub Pages mit `gh-pages`.
- **eject**: Ejects die `react-scripts` Konfiguration, um manuelle Anpassungen zu ermöglichen.

### Engines

Das Projekt wird mit folgenden Node.js- und npm-Versionen ausgeführt:

- **Node**: `8.9.4`
- **npm**: `5.6.0`

### Running Tests

Das Project kann mit `npm test` getestet werden.
Der Output sollte dann Zeigen, dass X von X test passen wie folgt:

```bash
Tests:       X passed, X total
```

Bei X handelt es sich um die Anzahl der Tests die durchgeführt werden und auch alle passen sollten.

### Deployment

Das Projekt kann mittels `gh-pages` auf Github pages gepublished werden. Das Projekt muss den branch 'gh-pages' in den Einstellungen des Projektes ausgewählt werden und dann Lokal `npm run deploy` ausgeführt werden.

### Synchronisation

Wenn eine Internetverbindung vorhanden ist werden die in der lokalen PouchDB datenbank gespeicherten Daten mit den in der CouchDB instanz gespeicherten Daten synchronisiert.

### Datenspeicherung

#### ShoppingList

Eine ShoppingList hat den folgenden Aufbau:

```json
{
  _id: "list:<ID>",
  _rev: "<Die Revision der shoppingList>",
  _deleted: false,
  type: "list",
  version: 1,
  title: "<title>"
  checked: false,
  place: <Unused>
  createdAt: <Wann die Liste erstellt wurde>,
  updatedAt: <Wann die Liste das letzte mal verändert wurde>
}
```

- \_id: Die ID der shoppingList mit dem prefix 'list:'
- \_rev: Die aktuelle Revision der shoppingList
- \_deleted: Gibt an ob die Liste bereits Lokal gelöscht wurde aber noch nicht aus der Datenbank gelöscht wurde
- type: Ob es sich um eine Liste oder ein Item handelt
- version: Welche version diese Liste hat
- title: Der Titel der Liste
- place: Sollte ein Ort des Shops angeben aber dieses feature wurde nicht implementiert
- createdAt: Wann die Liste erstellt wurde
- updatedAt: Wann die Liste geupdated wurde

#### Item

Ein Item gibt ein einzelnes Element einer ShoppingList wieder und ist wie folgt aufgebaut:

```json
{
  "_id": "item:<ID>",
  "_rev": <Revision des Items>,
  "_deleted": false,
  "type": "item",
  "version": 1,
  "list": "list:<ID>",
  "title": "<title>",
  "checked": false,
  "createdAt": <Wann das Item erstellt wurde>,
  "updatedAt": <Wann das Item geupdated wurde>
}
```

- \_id: Die ID des Items mit dem prefix 'item:'
- \_rev: Die aktuelle Revision des Items
- \_deleted: Gibt an ob das Item bereits Lokal gelöscht wurde aber noch nicht aus der Datenbank gelöscht wurde
- type: Ob es sich um eine Liste oder ein Item handelt
- version: Welche version dieses Item hat
- title: Der Name des Items
- checked: Ob das Item abgehakt wurde
- createdAt: Wann die Liste erstellt wurde
- updatedAt: Wann die Liste geupdated wurde

## Resources

- [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
- [PouchDB](https://pouchdb.com/)
- [Apache CouchDB](https://couchdb.apache.org/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [React](https://react.dev)
