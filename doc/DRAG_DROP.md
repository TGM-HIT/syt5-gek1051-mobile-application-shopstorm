# Drag and Drop Funktionalität

Eine Shoppinglist kann mittels Drag and Drop neu angeordnet werden, sodass Benutzer die Reihenfolge ihrer Listen anpassen können.

## Flow

Neuordnen von Shoppinglisten

- Um eine Shoppinglist neu anzuordnen, müssen die Punkte Links neben der shoppingListe gedückt gehalten werden.
- Nun kann die Liste an eine neue Position gezogen werden.
- Soballt die Liste an der gewünschten Position ist kann diese losgelassen werden um ihre neue Position zu wählen.

## Funktionen

Implementierung mit `@dnd-kit`

Die Drag and Drop Funktionalität wird mit der Bibliothek `@dnd-kit` implementiert, die eine moderne und zugängliche Lösung für React bietet:

```js

// DndContext umschließt den Bereich, in dem Drag and Drop möglich sein soll
const renderList = () => (
  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
  // Rest der Listen Implementierung
  </DndContext>

```

### Event-Handling

Der wichtigste Teil der Implementierung ist die handleDragEnd Funktion, die aufgerufen wird, wenn ein Drag-Vorgang abgeschlossen ist

```js
const handleDragEnd = (event) => {
  const { active, over } = event;

  // Falls kein Ziel gefunden wurde
  if (!over) return;

  const activeIndex = shoppingLists.findIndex((list) => list._id === active.id);
  const overIndex = shoppingLists.findIndex((list) => list._id === over.id);

  if (activeIndex !== overIndex) {
    const updatedLists = List(
      arrayMove(shoppingLists.toArray(), activeIndex, overIndex),
    );

    // Updaten der List in App.js
    setListsFunc(updatedLists);
    updateListOrder(updatedLists);

    // Speichern der reihenfolge Updated lists in localstorage
    const orderArray = updatedLists.map((list) => list._id);
    localStorage.setItem("shoppingListOrder", JSON.stringify(orderArray));
  }
};
```

### Sortierbare Items

Für sortierbare Listen wird der useSortable Hook verwendet, der eine Erweiterung von `@dnd-kit/core` ist

```js
function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
```

### Speichern der Reihenfolge

Die neue Reihenfolge der Items wird nach dem Drag and Drop Vorgang gespeichert:

```js
  // Nach dem Neuordnen die Änderungen speichern
  updateListOrder = (updatedLists) => {
      updatedLists.forEach((list, index) => {
      // Aktualisiere die Reihenfolge jedes Elements
      const updatedList = list.set('order', index);
      this.props.shoppingListRepository.put(updatedList);
    });
  });
```

## Resources

[dnd-kit homepage](https://dndkit.com/)
[@dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core)
[@dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable)
