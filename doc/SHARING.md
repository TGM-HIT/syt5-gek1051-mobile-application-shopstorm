# Einkaufslisten Teilen

Diese Anwendung ermöglicht es Benutzern, Einkaufslisten mit anderen zu teilen, sodass diese gemeinsam bearbeitet werden können. Im Mittelpunkt stehen drei Kernfunktionen: Das Erstellen eines teilbaren Links, das Zuweisen eines Namens für den Empfänger und das Verwalten des Zugriffs auf die Liste.

## Flow

### **Einkaufsliste teilen**  
- Der Nutzer klickt auf das **"Teilen"**-Symbol neben der gewünschten Einkaufsliste.  
- Es öffnet sich ein Dialog, in dem der Nutzer einen Namen für den Empfänger der Liste eingibt.  
- Nach dem Bestätigen wird ein teilbarer Link generiert, den der Nutzer kopieren und mit anderen teilen kann.  

### **Zugriff auf geteilte Liste**  
- Der Empfänger öffnet den geteilten Link in seinem Browser.  
- Die Liste wird automatisch zu seiner lokalen Einkaufslistenansicht hinzugefügt, sofern der Link gültig und nicht abgelaufen ist.  
- Der Zugriff auf die Liste bleibt auch nach dem Schließen des Tabs bestehen, da die Liste lokal gespeichert wird.  

### **Zugriff widerrufen**  
- Der ursprüngliche Ersteller der Liste kann den Zugriff für bestimmte Empfänger widerrufen.  
- Dazu navigiert er zur Verwaltung der Zugriffe und entfernt den Zugriff basierend auf dem zuvor zugewiesenen Namen.  

## Key Concept

Die Teilen-Funktion erweitert die Einkaufslisten-App um eine kollaborative Komponente, die es mehreren Benutzern ermöglicht, gemeinsam an einer Liste zu arbeiten. Dies geschieht durch die Erstellung eines teilbaren Links, der den Zugriff auf die Liste ermöglicht, ohne dass die Benutzer sich registrieren oder anmelden müssen.

**Was macht diese Funktion besonders?** Die Kombination aus Offline-Funktionalität und Synchronisation über eine zentrale Datenbank ermöglicht es, dass Benutzer auch dann auf die Liste zugreifen können, wenn sie nicht verbunden sind. Die Liste wird lokal gespeichert und synchronisiert, sobald eine Verbindung besteht.

- **Teilbare Links mit Ablaufdatum.** Jeder geteilte Link ist zeitlich begrenzt (z.B. 1 Tag) und kann nur innerhalb dieses Zeitraums verwendet werden, um die Liste hinzuzufügen. Dies erhöht die Sicherheit und verhindert unbefugten Zugriff nach Ablauf der Frist.  
- **Zugriffsverwaltung.** Der Ersteller der Liste kann den Zugriff für einzelne Empfänger widerrufen, indem er den zugewiesenen Namen verwendet. Dies ermöglicht eine granulare Kontrolle über die Berechtigungen.  
- **Lokale Speicherung und Synchronisation.** Die Liste wird beim Empfänger lokal gespeichert, sodass sie auch offline verfügbar ist. Änderungen werden automatisch mit der zentralen Datenbank synchronisiert, sobald eine Verbindung besteht.  
- **Benutzerfreundlichkeit im Fokus.** Die Funktion ist so gestaltet, dass sie einfach zu bedienen ist: Ein Klick auf das Teilen-Symbol, Eingabe eines Namens und Kopieren des Links. Der Empfänger muss lediglich den Link öffnen, um die Liste zu seiner Ansicht hinzuzufügen.  

Zielgruppe sind Benutzer, die gemeinsam Einkaufslisten verwalten möchten, wie z.B. Familienmitglieder, Mitbewohner oder Teams, die zusammenarbeiten.
