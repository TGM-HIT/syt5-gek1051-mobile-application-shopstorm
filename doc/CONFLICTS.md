# Konfliktlösung

In diesem Projekt können Konflikte auftreten, wenn mehrere Clients gleichzeitig Änderungen an denselben Dokumenten vornehmen und diese Änderungen nicht automatisch zusammengeführt werden können. Die Konfliktlösung ist ein zentraler Bestandteil, um sicherzustellen, dass die Datenkonsistenz zwischen den Clients und der Datenbank gewahrt bleibt.

## Flow

### Erkennen von Konflikten

- Konflikte werden erkannt, wenn während der Synchronisation Änderungen von der Remote-Datenbank abgerufen werden.
- Wenn ein Dokument Konflikte aufweist, wird dies durch das Vorhandensein des `_conflicts`-Feldes signalisiert.
- Sobald ein Konflikt erkannt wird, wird die Methode `handleConflicts` aufgerufen, um die betroffenen Dokumente zu verarbeiten.

### Lösen von Konflikten

- Die Methode `resolveConflict` wird verwendet, um Konflikte für ein bestimmtes Dokument zu lösen.
- Ein Beispiel für die automatische Lösung von Konflikten ist das Beibehalten der neuesten Revision des Dokuments und das Löschen der unterlegenen Revisionen.
- Nach der Lösung des Konflikts wird die Benutzeroberfläche aktualisiert, um sicherzustellen, dass die Änderungen sichtbar sind.

## Funktionen

### Erkennen von Konflikten

Die Methode `handleConflicts` überprüft eine Liste von Dokumenten auf das Vorhandensein von Konflikten und leitet die Lösung ein. Ein Beispielaufruf wäre:

```js
handleConflicts = (docs) => {
  docs.forEach((doc) => {
    if (doc._conflicts && doc._conflicts.length > 0) {
      console.log("Conflicts detected for document:", doc._id);
      this.resolveConflict(doc);
    }
  });
};
```

Diese Funktion iteriert über alle synchronisierten Dokumente und ruft für jedes Dokument mit Konflikten die Funktion `resolveConflict` auf.

### Lösen von Konflikten

Die Methode `resolveConflict` löst die Konflikte eines bestimmten Dokuments. Ein Beispielaufruf wäre:

```js
resolveConflict = (doc) => {
  this.props.localDB
    .get(doc._id, { conflicts: true })
    .then((conflictedDoc) => {
      const winningRevision = conflictedDoc._rev;
      const losingRevisions = conflictedDoc._conflicts;

      const deletePromises = losingRevisions.map((rev) =>
        this.props.localDB.remove(conflictedDoc._id, rev),
      );

      return Promise.all(deletePromises).then(() => {
        console.log(`Resolved conflicts for document: ${conflictedDoc._id}`);
        this.getShoppingLists();
      });
    })
    .catch((err) => console.error("Error resolving conflict:", err));
};
```

In diesem Beispiel wird die neueste Revision (`winningRevision`) beibehalten und alle anderen Revisionen (`losingRevisions`) werden aus der lokalen Datenbank entfernt.

### Synchronisation mit Konfliktlösung

Die Synchronisation wird in diesem Projekt wie folgend implementiert:

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

Hier wird bei jeder Änderung geprüft, ob es sich um einen Pull-Vorgang handelt (Daten aus der Remote-Datenbank), und anschließend werden potenzielle Konflikte verarbeitet.

## Key Concept

Die Lösung von Datenkonflikten ist ein zentraler Bestandteil dieses Projekts. Sie stellt sicher, dass Benutzer auch in einer Umgebung mit mehreren Clients konsistente Daten sehen und bearbeiten können.

Die Kernidee hinter der Konfliktlösung ist:

- **Konflikte erkennen:** Identifizieren von Dokumenten mit mehreren Revisionen.
- **Konflikte lösen:** Automatisches Beibehalten der neuesten Revision oder Implementierung einer benutzerdefinierten Logik zur Zusammenführung von Änderungen.
- **Konsistenz sicherstellen:** Aktualisierung der Benutzeroberfläche nach der Lösung von Konflikten.

Durch diese Mechanismen wird gewährleistet, dass das System auch in komplexen Synchronisationsszenarien zuverlässig funktioniert.

## Resources

[CouchDB](https://couchdb.apache.org/)
[PouchDB](https://pouchdb.com/)
[Conflict handling in CouchDB](https://guide.couchdb.org/draft/conflicts.html)
