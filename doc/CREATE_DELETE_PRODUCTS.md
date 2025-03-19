# Creating and Deleting Products

## Creating Products

```js
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

## Deleting Products

```js
  deleteShoppingListItem = (itemid) => {
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      return this.props.shoppingListRepository.deleteItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }
```
