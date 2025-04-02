# Technische Dokumentation

## Projektinformationen

- **Name**: `shopping-list-react-pouchdb`
- **Version**: `0.1.0`

## Dependencies

Das Projekt verwendet verschiedene Bibliotheken, darunter React, PouchDB und weitere Tools zur Entwicklung und Verwaltung der Anwendung. Die vollständige Liste der Abhängigkeiten ist in der `package.json` unter `"dependencies"` aufgeführt.

### Entwicklungsabhängigkeiten

Die Entwicklungsumgebung wird durch folgende Tools unterstützt:

- **Webpack** und zugehörige Plugins (`webpack-cli`, `webpack-dev-server`)
- **Babel** für JavaScript-Transpilation
- **Cypress** für End-to-End-Testautomatisierung
- **gh-pages** für Deployment auf GitHub Pages
- Weitere Tools wie `npm-run-all`, `r3f-pack`, und `html-webpack-plugin`.

## Scripts

Das Projekt enthält folgende Scripts, die über npm ausgeführt werden können:

- **start**: Startet die Entwicklungsumgebung mit `r3f-pack start`.
- **build**: Erstellt eine Produktionsversion mit `r3f-pack build`.
- **predeploy**: Führt vor dem Deployment den Build-Prozess aus.
- **deploy**: Deployt die Anwendung auf GitHub Pages mit `gh-pages -d build`.
- **cy:open**: Öffnet die Cypress-Testumgebung.
- **test:cypress**: Führt Cypress Tests aus (`npx cypress run`).
- **test:all**: Führt alle Tests parallel aus (`npm-run-all -p start test:cypress`).

## Engines

Das Projekt erfordert folgende Node.js und npm-Versionen:

- **Node.js**: `>=18.20.8`
- **npm**: `>=11.2.0`

## Running Tests

Tests können mit Cypress durchgeführt werden entweder mittels `npm run cy:open` was die GUI von Cypress zeigt.
Oder mittels `npm run test:cypress` hierfür muss jedoch der server auf `localhost:3000` erreichbar sein. Dies kann automatisch mittels `npm run test:all` gemacht werden. Jedoch muss bei diesemm sobald alle tests durchgeführt wurden, mittels Control+C der Webserver beendet werden.


## Beispiel für einen Cypress-Test

Hier ist ein Beispiel wie ein Test für Cypress angelegt werden kann:

```js
//file: cypress/e2e/filename.cy.js

// Führt vor jedem Test eine Setup-Routine aus
beforeEach(() => {
  // Besucht die lokale Anwendung unter der angegebenen URL
  cy.visit('http://localhost:3000');
  
  // Überprüft, ob das Fenster die Eigenschaft 'document' hat und ob die Seite vollständig geladen ist
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  
  // Wartet 2 Sekunden, um sicherzustellen, dass alle Ressourcen geladen sind
  cy.wait(2000);

  // Erstellt einen Zeitstempel, der als eindeutiger Name für die Einkaufsliste verwendet wird
  const time = new Date().getTime();

  // Erstellt eine neue Einkaufsliste
  cy.get('#add').click(); // Klickt auf die Schaltfläche "+"
  cy.get('.MuiTextField-root').type(time + "{enter}"); // Gibt den Zeitstempel als Namen ein und drückt Enter
  cy.get('.MuiButtonBase-root').eq(2).click(); // Öffnet das Menü für die Einkaufsliste
  cy.get('[role="menuitem"]').eq(0).click(); // Wählt die Option aus, um die Einkaufsliste zu öffnen
});

// Beschreibt den Testfall für das Hinzufügen von Artikeln zur Einkaufsliste
describe('Create ShoppingListItem', () => {
  it('passes', () => {
    // Fügt einen Artikel namens "Apple" zur Einkaufsliste hinzu
    cy.get('#add').click(); // Klickt auf die Schaltfläche "+"
    cy.get('.MuiTextField-root').type("Apple{enter}"); // Gibt "Apple" als Artikelname ein und drückt Enter

    // Fügt einen weiteren Artikel namens "Bannanas" zur Einkaufsliste hinzu
    cy.get('#add').click(); // Klickt erneut auf die Schaltfläche "+"
    cy.get('.MuiTextField-root').type("Bannanas{enter}"); // Gibt "Bannanas" als Artikelname ein und drückt Enter

    // Überprüft, ob insgesamt 8 Buttons vorhanden sind:
    // Die ersten vier sind für Navigation (zurück, about, Einstellungen und +),
    // und zwei Buttons pro hinzugefügtem Artikel (Checkbox und ...-Menu).
    cy.get('.MuiButtonBase-root').should('have.length', 8);
  });
});

```

## Deployment

Das Projekt kann mittels GitHub Pages veröffentlicht werden:

1. Stellen Sie sicher, dass der Branch `'gh-pages'` in den Einstellungen des Repositories ausgewählt ist.
2. Führen Sie lokal den Befehl `npm run deploy` aus.

## Synchronisation

Die lokale PouchDB-Datenbank synchronisiert automatisch Daten mit einer CouchDB-Datenbankinstanz, sofern eine Internetverbindung besteht.

## Datenspeicherung

### ShoppingList

Eine ShoppingList hat den folgenden Aufbau:

```json
{
  "_id": "list:<ID>",
  "_rev": "<Die Revision der shoppingList>",
  "_deleted": false,
  "type": "list",
  "version": 1,
  "title": "<title>",
  "checked": false,
  "place": null,
  "createdAt": "<Wann die Liste erstellt wurde>",
  "updatedAt": "<Wann die Liste das letzte Mal verändert wurde>"
}
```


### Item

Ein Item repräsentiert ein einzelnes Element einer ShoppingList:

```json
{
  "_id": "item:<ID>",
  "_rev": "<Revision des Items>",
  "_deleted": false,
  "type": "item",
  "version": 1,
  "list": "list:<ID>",
  "title": "<title>",
  "checked": false,
  "createdAt": "<Wann das Item erstellt wurde>",
  "updatedAt": "<Wann das Item zuletzt aktualisiert wurde>"
}
```


Weitere Informationen zu den ShoppingLists und Items finden Sie in der [Einkaufslistenverwaltungs-Dokumentation](https://github.com/TGM-HIT/syt5-gek1051-mobile-application-shopstorm/blob/main/doc/EINKAUFSLISTENVERWALTUNG.md) und der [Dokumentation der Shoppinglist Items](https://github.com/TGM-HIT/syt5-gek1051-mobile-application-shopstorm/blob/main/doc/LIST_ITEMS.md).

## Resources

Hier sind einige nützliche Ressourcen zur Unterstützung bei der Entwicklung:

- [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
- [PouchDB](https://pouchdb.com/)
- [Apache CouchDB](https://couchdb.apache.org/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [React](https://react.dev)
- [CouchDB in Docker](https://hub.docker.com/_/couchdb)
- [Cypress](https://www.cypress.io/)
- [Reaact-API](https://react.dev/reference/react/apis)
- [Webpack](https://webpack.js.org/)
- [gh-pages npm](https://www.npmjs.com/package/gh-pages)