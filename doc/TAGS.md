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
