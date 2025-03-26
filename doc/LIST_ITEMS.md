# Shoppinglist Items

Eine Shoppinglist besteht aus einem oder mehreren Items welche abgehakt werden können.

## Flow

### Erstellen eines Shoppinglist Items

- Eine Shoppinglist wird geöffner indem auf die drei ... gedrückt wird und 'Open' ausgewählt wird.
- Ein Shoppinglist Item kann erstellt werden indem auf das '+' Symbol gedrückt wird und und ein Name für das Item eingegeben wird.
- Dieses kann mittels Enter bestätigt werden und ist nun in der Shoppinglist zu sehen.

### Löschen eines Shoppinglist Items

- Eine Shoppinglist wird geöffner indem auf die drei ... gedrückt wird und 'Open' ausgewählt wird.
- Ein Shoppinglist Item kann gelöscht werden indem auf die drei ... neben dem Item gedrückt wird und 'Delete' ausgewählt wird.

## Funktionen

### Erstellen

Ein neues Shoppinglist Item kan mittels der `createNewListOrItem` funktion erstellt werden. Ein beispiel wäre:

```js
<form onSubmit={this.createNewShoppingListOrItem}>
```

Es wird dann überprüft ob die aktuelle vieww `lists` oder `items` ist und jenachdem wird ein neues Item oder eine neue Liste erstellt.

### Löschen

Ein Shoppinglist Item kann gelöscht wrden indem die funktion `this.props.shoppingListRepository.deleteItem` verwendet wrden.
Ein Beispiel für einen Call wäre:

```js
this.props.shoppingListRepository
  .getItem(itemid)
  .then((item) => {
    return this.props.shoppingListRepository.deleteItem(item);
  })
  .then(this.refreshShoppingListItems(this.state.shoppingList._id));
```

Es wird das Shoppinglist Item mit der übergebenen ID aus dem Repository geholt und dieses wird dann aus dem Repository gelöscht.

## Key Concept

Die Funktionen zum verwanter von Shoppinglist Items ist ein Zentrales feature dieses Projektes, welche dem Benutzer erlauben die Produkte welche er kaufen will auch zu verwalten. Die Kernfunktionen sind das Erstellen und Löschen der Items.

Während der Erstellung des Items muss ein Titel angegeben werden, welcher der angezeigte Name des Items ist. Somit weiss der Nurzer welche Produkte er kaufen will.
