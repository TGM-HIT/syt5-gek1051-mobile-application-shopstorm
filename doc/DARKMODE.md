# Dark Mode Funktionalität

Die Anwendung bietet einen Dark Mode, der es Benutzern ermöglicht, zwischen heller und dunkler Benutzeroberfläche zu wechseln, um die Lesbarkeit bei unterschiedlichen Lichtverhältnissen zu verbessern.

## Flow

Umschalten des Dark Mode

- Der Dark Mode kann über das Helligkeits-Icon in der Navigationsleiste umgeschaltet werden
- Bei Aktivierung des Dark Mode wird die gesamte Benutzeroberfläche in ein dunkleres Farbschema umgewandelt
- Die Einstellung wird gespeichert und bleibt auch nach dem Neuladen der Anwendung erhalten

### Funktionen

#### Implementierung mit darkreader

Die Dark Mode Funktionalität wird mit der Bibliothek `darkreader` implementiert, die eine einfache Lösung für das Umschalten zwischen Light- und Darkmode dient:

```js
import {
  enable as enableDarkMode,
  disable as disableDarkMode,
} from "darkreader";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon
```

#### Initialisierung des Theme Mode

Im Constructor wird der gespeicherte Theme Mode aus dem localStorage geladen und wenn als letztes Darkmode ausgewählt war wird dieser wieder gesetst:

```js
constructor(props) {
  // Andere Initialisierungen...

  const savedThemeMode = localStorage.getItem('themeMode') || 'light';

  if (savedThemeMode === 'dark') {
    enableDarkMode();
  }

  this.state = {
  // Andere State-Eigenschaften...
  themeMode: savedThemeMode,
  }
}
```

### Toggle-Funktion für den Dark Mode

Die Hauptfunktion zum Umschalten des Dark Mode:

```js
toggleThemeMode = () => {
  const newMode = this.state.themeMode === "light" ? "dark" : "light";
  this.setState({ themeMode: newMode });
  localStorage.setItem("themeMode", newMode); // Speichern der Präferenz
  if (newMode === "light") {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
};
```

### UI-Komponenten für den Dark Mode

In der Navigationsleiste wird ein Icon-Button zum Umschalten des Dark Mode angezeigt:

```js
renderActionButtons = () => (
  <>
    <IconButton onClick={this.toggleThemeMode} color="inherit">
      {this.state.themeMode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>

    {/* Andere Action Buttons */}
  </>
);
```

## Ressourcen

[Darkreader Homepage](https://darkreader.org/)
[Darkreader npm](https://www.npmjs.com/package/darkreader)
[Material-UI Icons](https://mui.com/material-ui/material-icons/)
