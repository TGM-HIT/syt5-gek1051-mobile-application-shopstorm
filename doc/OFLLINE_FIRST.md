# Offline First Funktionalität

Die Anwendung wurde mit dem Ansatz "Offline First" entwickelt, um sicherzustellen, dass Benutzer jederzeit und überall Zugriff auf ihre Einkaufsdaten haben – auch ohne Internetverbindung.

---

## Flow

- **Lokale Datenspeicherung:**  
  Beim ersten Laden der Anwendung wird PouchDB als In-Browser-Datenbank verwendet, um alle Einkaufslisten und Items lokal zu speichern. Dadurch stehen die Daten auch dann zur Verfügung, wenn keine Internetverbindung besteht.

- **Synchronisation:**  
  Sobald eine Remote-Datenbank (wie Apache CouchDB oder IBM Cloudant) konfiguriert ist, wird automatisch eine kontinuierliche Synchronisation zwischen der lokalen PouchDB und der Remote-Datenbank durchgeführt. Das bedeutet:

    - Änderungen, die lokal vorgenommen werden, werden live synchronisiert, sobald eine Internetverbindung besteht.
    - Änderungen aus der Remote-Datenbank werden ebenfalls in die lokale Datenbank übernommen.
- **Konfliktlösung:**  
  Bei gleichzeitigen Änderungen von mehreren Clients können Konflikte auftreten. Diese werden automatisch erkannt und über spezielle Funktionen gelöst, sodass stets die neueste Revision beibehalten und unterlegene Revisionen gelöscht werden.

- **Service Worker:**  
  Ein Service Worker wird registriert, um statische Assets (HTML, CSS, JavaScript) zu cachen. Dadurch kann die Anwendung nach dem ersten Laden auch offline gestartet werden.


---

## Funktionen

### 1. Lokale Datenspeicherung mit PouchDB

- **Beschreibung:**  
  PouchDB speichert alle Einkaufsdaten (Listen und Items) direkt im Browser. Das ermöglicht den Offline-Zugriff und Bearbeiten der Daten, selbst wenn keine Netzwerkverbindung besteht.

### 2. Synchronisation mit Remote-Datenbank

- **Beschreibung:**  
  Mittels der `syncToRemote`-Funktion wird eine Live-Synchronisation zwischen der lokalen Datenbank und einer Remote-Datenbank (z. B. CouchDB oder Cloudant) durchgeführt.
- **Mechanismus:**
    - **Live Sync:** Die Synchronisation läuft dauerhaft im Hintergrund (`live: true, retry: true`), sodass alle Änderungen sofort abgeglichen werden.
    - **Konfliktbehandlung:** Konflikte werden automatisch erkannt (über das Vorhandensein des `_conflicts`-Feldes) und durch die Funktionen `handleConflicts` und `resolveConflict` bereinigt.

### 3. Konfliktlösung

- **Beschreibung:**  
  Bei auftretenden Konflikten wird die Funktion `resolveConflict` aufgerufen, um:
    - Die neueste Revision des Dokuments beizubehalten.
    - Die unterlegenen Revisionen aus der lokalen Datenbank zu entfernen.
- **Nutzen:**  
  Dies stellt sicher, dass alle Clients stets konsistente und aktuelle Daten sehen.

### 4. Service Worker

- **Beschreibung:**  
  Ein Service Worker wird genutzt, um statische Ressourcen zu cachen.
- **Nutzen:**  
  Dadurch kann die Anwendung auch dann geladen werden, wenn der Benutzer offline ist, was die Verfügbarkeit und die Ladezeiten verbessert.

---

## Codebeispiele

### Synchronisation zwischen lokaler und Remote-Datenbank

```js
syncToRemote = () => {
  this.props.localDB
    .sync(this.remoteDB, { live: true, retry: true })
    .on("change", (change) => {
      if (change.direction === "pull") {
        this.handleConflicts(change.change.docs);
      }
      this.getPouchDocs();
    })
    .on("error", (err) => console.error("Error during sync:", err));
};
```

```js
resolveConflict = (doc) => {
  // Hole das Dokument inklusive aller Konflikte
  this.props.localDB.get(doc._id, { conflicts: true })
    .then((conflictedDoc) => {
      // Ermittle die unterlegenen Revisionen
      const losingRevisions = conflictedDoc._conflicts;
      // Erstelle für jede unterlegene Revision einen Lösch-Promise
      const deletePromises = losingRevisions.map((rev) =>
        this.props.localDB.remove(conflictedDoc._id, rev)
      );
      // Sobald alle Löschungen abgeschlossen sind, aktualisiere die Einkaufslisten
      return Promise.all(deletePromises).then(() => {
        console.log(`Resolved conflicts for document: ${conflictedDoc._id}`);
        this.getShoppingLists();
      });
    })
    .catch((err) => console.error("Error resolving conflict:", err));
};
```

Quellen: [Setting up CouchDB](https://pouchdb.com/guides/setup-couchdb.html)[Setting up CouchDB](https://pouchdb.com/guides/setup-couchdb.html)

[Conflicts](https://pouchdb.com/guides/conflicts.html)