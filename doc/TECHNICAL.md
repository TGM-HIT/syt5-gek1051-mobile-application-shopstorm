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
