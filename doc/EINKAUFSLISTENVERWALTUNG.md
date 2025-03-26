# Einkaufslistenverwaltung
Diese Anwendung bietet eine umfassende Lösung zur Verwaltung von Einkaufslisten. Im Mittelpunkt stehen drei Kernfunktionen: Das Erstellen neuer Einkaufslisten mit beliebig vielen Artikeln, das Bearbeiten bestehender Listen durch Hinzufügen, Ändern oder Entfernen von Einträgen, sowie das vollständige Löschen nicht mehr benötigter Einkaufslisten.

## Flow

### **Einkaufsliste erstellen**  
- Der Nutzer klickt auf den **„+“**-Button, um eine neue Einkaufsliste zu erstellen.  
- Anschließend kann die Liste benannt sowie ein Ort und eine Adresse hinterlegt werden.  
- Sobald der Nutzer mit den Eingaben zufrieden ist, kann er auf das **„Check“-Symbol** klicken, um die Einkaufsliste zu speichern.  

### **Einkaufsliste bearbeiten**  
- Der Nutzer klickt auf die **drei Punkte** der gewünschten Einkaufsliste.  
- Zum Bearbeiten wählt er das **„Stift“-Symbol** aus.  
- Danach kann die Liste angepasst und die Änderungen gespeichert werden.  

### **Einkaufsliste löschen**  
- Der Nutzer klickt auf die **drei Punkte** der gewünschten Einkaufsliste.  
- Zum Löschen der Liste wählt er das **„Müll“-Symbol** aus.  

## Key Concept
Diese Einkaufslisten-App ist eine kleine Single-Page-Webanwendung, bestehend aus einer HTML-Datei, einigen CSS-Dateien und einer JavaScript-Datei. Die Webanwendung ermöglicht es Nutzern, mehrere Einkaufslisten zu erstellen (z.B. Lebensmittel) mit verschiedenen Artikeln pro Liste (z.B. Brot, Wasser).

**Was macht diese App besonders?** Ihre Flexibilität und Benutzerfreundlichkeit beim Einkaufsmanagement. Der Ansatz konzentriert sich darauf, Nutzern eine optimale Kontrolle und Planung ihrer Einkäufe zu bieten, unabhängig von Geräten oder Netzwerkbedingungen.

**Einkaufslisten erstellen und verwalten.** Die Anwendung ermöglicht das mühelose Erstellen von Einkaufslisten mit umfangreichen Bearbeitungsmöglichkeiten. Nutzer können Listen nach Belieben hinzufügen, modifizieren und löschen, was eine maximale Flexibilität bei der Einkaufsplanung gewährleistet.

**Geschäftsauswahl mit intelligenten Funktionen.** Nutzer können festlegen, in welchem Geschäft sie einkaufen möchten. Die App bietet intelligente Vorschläge und Unterstützung bei der Geschäftsauswahl, um Einkäufe zu optimieren und zu vereinfachen.
Dynamische Listenverwaltung. Artikel können jederzeit hinzugefügt und entfernt werden. Dies ermöglicht eine flexible und individuelle Gestaltung der Einkaufslisten, die sich genau an die Bedürfnisse der Nutzer anpasst.

**Sicheres Löschen und Archivieren.** Die Löschfunktion wurde mit Bedacht konzipiert. Nutzer können Listen gezielt entfernen, wobei Sicherheitsmechanismen versehentliche Löschungen verhindern. Optional kann ein Archivierungssystem implementiert werden.

**Benutzerfreundlichkeit im Fokus.** Die Anwendung zielt auf eine intuitive Bedienoberfläche ab, die es Nutzern ermöglicht, schnell und einfach Einkaufslisten zu erstellen, zu bearbeiten und zu verwalten.
Die App kann als Progressive Web App entwickelt werden, die auf verschiedenen Geräten funktioniert und optional Offline-Funktionalitäten bietet. Technologisch könnte sie auf Frameworks wie Vue.js und Datenbankbibliotheken wie PouchDB aufbauen, um Datenpersistenz und Synchronisation zu gewährleisten.

Zielgruppe sind alle, die ihre Einkäufe strukturiert und planvoll angehen möchten - von Einzelpersonen über Familien bis hin zu Haushalten mit komplexen Einkaufsanforderungen.

## Implementation
### Übersicht


```javascript
/**
   * Create a new shopping list or item based on where the event came from
   * @param {event} evt The click event on the UI element requesting to the action. Get the name from state and decide whether to add a list or an item based on the `state.view`
   */
  createNewShoppingListOrItem = (e) => {
    e.preventDefault();
    this.setState({adding: false});
   
    if (this.state.view === 'lists') {
      let shoppingList = this.props.shoppingListFactory.newShoppingList({
        title: this.state.newName
      });
      this.props.shoppingListRepository.put(shoppingList).then(this.getShoppingLists);
    } else if (this.state.view === 'items') {
      let item = this.props.shoppingListFactory.newShoppingListItem({
        title: this.state.newName
      }, this.state.shoppingList);
      this.props.shoppingListRepository.putItem(item).then(item => {
        this.getShoppingListItems(this.state.shoppingList._id).then(items => {
          this.setState({
            view: 'items',
            shoppingListItems: items
          });
        });
      });
    }
  }
```

## Detaillierte Erklärung

### 1. Methodensignatur und Dokumentation

- **Typ**: Pfeilfunktion (Arrow Function)
- **Parameter**: `e` (Ereignis-Objekt)
- **Zweck**: Erstellen neuer Einkaufslisten oder Listenelemente

### 2. Ereignisbehandlung

```javascript
e.preventDefault();
this.setState({adding: false});
```

- Verhindert Standardereignisverhalten
- Beendet den Hinzufügemodus

### 3. Erstellung von Einkaufslisten

```javascript
if (this.state.view === 'lists') {
  let shoppingList = this.props.shoppingListFactory.newShoppingList({
    title: this.state.newName
  });
  this.props.shoppingListRepository.put(shoppingList).then(this.getShoppingLists);
}
```

**Ablauf**:
- Prüft, ob Ansicht auf 'lists' gesetzt ist
- Erstellt neue Einkaufsliste mit:
  - Factory-Methode
  - Titel aus Komponentenzustand
- Speichert Liste über Repository
- Aktualisiert Einkaufslisten nach Speicherung

### 4. Erstellung von Listenelementen

```javascript
else if (this.state.view === 'items') {
  let item = this.props.shoppingListFactory.newShoppingListItem({
    title: this.state.newName
  }, this.state.shoppingList);
  this.props.shoppingListRepository.putItem(item).then(item => {
    this.getShoppingListItems(this.state.shoppingList._id).then(items => {
      this.setState({
        view: 'items',
        shoppingListItems: items
      });
    });
  });
}
```

**Ablauf**:
- Prüft, ob Ansicht auf 'items' gesetzt ist
- Erstellt neues Listenelement mit:
  - Factory-Methode
  - Titel aus Komponentenzustand
  - Referenz zur aktuellen Einkaufsliste
- Speichert Element über Repository
- Lädt Listenelemente neu
- Aktualisiert Komponentenzustand

## Kernkonzepte

- **Factory-Methoden**: Objektiverstellung
- **Asynchrone Operationen**: Promises
- **Zustandsmanagement**: React-Komponentenzustand
- **Kontextabhängige Objekterstellung**


