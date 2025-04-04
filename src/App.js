import React from 'react';
import { List } from 'immutable';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { grey, blueGrey, pink } from '@mui/material/colors';
import { enable as enableDarkMode, disable as disableDarkMode } from 'darkreader';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon

import PouchDB from 'pouchdb';

import ShoppingLists from './components/ShoppingLists';
import ShoppingList from './components/ShoppingList';

const muiTheme = createTheme({
  palette: {
    textColor: grey,
    primary1Color: pink,
    accent1Color: blueGrey
  }
});
const appBarStyle = {
  backgroundColor: blueGrey,
  width: "100%",
};
const NOLISTMSG = "Click the + sign below to create a shopping list.";
const NOITEMSMSG = "Click the + sign below to create a shopping list item.";

class App extends React.Component {
  constructor(props) {
    super(props);
    try {
      if (localStorage.getItem("remoteUrl") !== undefined || localStorage.getItem("remoteUrl") !== null) {
        this.remoteDB = new PouchDB(localStorage.getItem("remoteUrl"));
        this.syncToRemote();
      }
    } catch {
      this.remoteDB = props.remoteDB;
    }


    const savedThemeMode = localStorage.getItem('themeMode') || 'light';

    if (savedThemeMode === 'dark') {
      enableDarkMode();
    }

    this.state = {
      shoppingList: null,
      shoppingLists: [],
      totalShoppingListItemCount: List(),
      checkedTotalShoppingListItemCount: List(),
      shoppingListItems: null,
      adding: false,
      view: 'lists',
      newName: '',
      settingsOpen: false,
      aboutOpen: false,
      themeMode: savedThemeMode,
    }
  }

  componentDidMount = () => {
    this.getShoppingLists();
    if (this.remoteDB) {
      this.syncToRemote();
    }
  };

  toggleThemeMode = () => {
    const newMode = this.state.themeMode === 'light' ? 'dark' : 'light';
    this.setState({ themeMode: newMode });
    localStorage.setItem('themeMode', newMode); // Save preference
    if (newMode === 'light') {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };

  checkAllListItems = (listId) => {
    const { shoppingListItems } = this.state;
    const updatedItems = shoppingListItems.map(item =>
      item.listId === listId ? { ...item, checked: !item.checked } : item
    );
    this.setState({ shoppingListItems: updatedItems });
  };

  toggleItemCheckFunc = (e) => {
    const itemId = e.target.dataset.id;

    // Validate itemId
    if (!itemId || typeof itemId !== 'string') {
      console.error("Invalid item ID:", itemId);
      return;
    }

    // Toggle the item's checked state
    this.props.shoppingListRepository.getItem(itemId)
      .then((item) => {
        item = item.set('checked', !item.checked);
        return this.props.shoppingListRepository.putItem(item);
      })
      .then(() => this.refreshShoppingListItems(this.state.shoppingList._id))
      .catch((err) => console.error("Error toggling item:", err));
  };

  syncToRemote = () => {
    this.props.localDB.sync(this.remoteDB, { live: true, retry: true })
      .on('change', change => {
        if (change.direction === 'pull') {
          this.handleConflicts(change.change.docs);
        }
        this.getPouchDocs();
      })
      .on('error', err => console.error('Error during sync:', err));
  };

  handleConflicts = (docs) => {
    docs.forEach(doc => {
      if (doc._conflicts && doc._conflicts.length > 0) {
        this.resolveConflict(doc);
      } else {
        
      }
    });
  };

  resolveConflict = (doc) => {
    this.props.localDB.get(doc._id, { conflicts: true })
      .then(conflictedDoc => {
        const losingRevisions = conflictedDoc._conflicts;
        const deletePromises = losingRevisions.map(rev =>
          this.props.localDB.remove(conflictedDoc._id, rev)
        );
        return Promise.all(deletePromises).then(() => this.getShoppingLists());
      })
      .catch(err => console.error('Error resolving conflict:', err));
  };

  getShoppingLists = () => {
    let checkedCount = List();
    let totalCount = List();
    let lists = null;

    return this.props.shoppingListRepository.find()
      .then((foundLists) => {
        lists = foundLists.sort((a, b) => {
          const savedOrder = JSON.parse(localStorage.getItem('shoppingListOrder') || '[]');
          const getOrder = (list) => {
            const index = savedOrder.indexOf(list._id);
            return index === -1 ? Infinity : index;
          };
          return getOrder(a) - getOrder(b);
        });
        return foundLists;
      })
      .then(() => this.props.shoppingListRepository.findItemsCountByList())
      .then((countsList) => {
        totalCount = countsList;
        return this.props.shoppingListRepository.findItemsCountByList({
          selector: { type: 'item', checked: true },
          fields: ['list'],
        });
      })
      .then((checkedList) => {
        checkedCount = checkedList;
        this.setState({
          view: 'lists',
          shoppingLists: lists,
          shoppingListItems: null,
          checkedTotalShoppingListItemCount: checkedCount,
          totalShoppingListItemCount: totalCount,
        });
      });
  };

  updateListOrder = (reorderedLists) => {

    if (!Array.isArray(reorderedLists) || reorderedLists.length === 0) {
      console.error('Invalid list array for reordering');
      return;
    }

    // Filter out any invalid list items (those without a valid _id)
    const validLists = reorderedLists.filter(list => {
      return list && list._id && typeof list._id === 'string' && list._id.startsWith('list:');
    });
    const orderMap = new Map();
    validLists.forEach((list, index) => orderMap.set(list._id, index));

    const updatePromises = validLists.map((list) => {
      const listId = list._id;

      // Additional validation for list ID format
      if (!listId || typeof listId !== 'string' || !listId.startsWith('list:')) {
        console.warn(`Skipping list with invalid ID format: ${listId}`);
        return Promise.resolve();
      }
      return this.props.shoppingListRepository.get(list._id)
        .then(shoppingList => {
          shoppingList = shoppingList.set('order', orderMap.get(list._id));
          return this.props.shoppingListRepository.put(shoppingList);
        })
        .catch(err => console.error(`Error updating order for list ${list._id}:`, err));
    });

    Promise.all(updatePromises).then(() => this.getShoppingLists());
  };

  openShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then(list => {
      this.getShoppingListItems(listid).then(items => {
        this.setState({
          view: 'items',
          shoppingList: list,
          shoppingListItems: items
        });
      });
    });
  };

  setLists = (lists) => {
    this.setState({ shoppingLists: lists });
  }
  getShoppingListItems = (listid) => {
    return this.props.shoppingListRepository.findItems({
      selector: { type: 'item', list: listid }
    });
  };

  refreshShoppingListItems = (listid) => {
    this.props.shoppingListRepository.findItems({
      selector: { type: 'item', list: listid }
    }).then(items => this.setState({ shoppingListItems: items }));
  };

  renameShoppingList = (listId, newName) => {
    if (!listId || typeof listId !== 'string') {
      console.error('Invalid list ID:', listId);
      return Promise.reject('Invalid list ID');
    }
  
    return this.props.shoppingListRepository.get(listId)
      .then(list => {
        list = list.set('title', newName);
        return this.props.shoppingListRepository.put(list);
      })
      .then(() => this.getShoppingLists())
      .catch(err => console.error('Error renaming list:', err));
  };

  renameShoppingListItem = (itemid, newname, selectedTag) => {
    if (!itemid || typeof itemid !== 'string') {
      console.error('Invalid item ID:', itemid);
      return;
    }

    return this.props.shoppingListRepository.getItem(itemid)
      .then(item => {
        const combinedTitle = `${newname}$${selectedTag}`;
        item = item.set('title', combinedTitle);
        return this.props.shoppingListRepository.putItem(item);
      })
      .then(() => this.refreshShoppingListItems(this.state.shoppingList._id))
      .catch(err => console.error('Error updating item:', err));
  };

  deleteShoppingListItem = (itemid) => {
    this.props.shoppingListRepository.getItem(itemid)
      .then(item => this.props.shoppingListRepository.deleteItem(item))
      .then(() => this.refreshShoppingListItems(this.state.shoppingList._id));
  };

  toggleItemCheck = (evt) => {
    const itemid = evt.target.dataset.id;
    if (!itemid) return;

    this.props.shoppingListRepository.getItem(itemid)
      .then(item => {
        item = item.set('checked', !item.checked);
        return this.props.shoppingListRepository.putItem(item);
      })
      .then(() => this.refreshShoppingListItems(this.state.shoppingList._id))
      .catch(err => console.error('Error toggling item check:', err));
  };

  /**
   * Check off all items in the shopping list
   * @param {string} listid id of a shopping list
   */
  checkAllListItems = (listid) => {
    let listcheck = true;
    this.getShoppingListItems(listid).then(items => {
      let newitems = [];
      items.forEach(item => {
        if (!item.checked) {
          newitems.push(item.mergeDeep({ checked: true }));
        }
      }, this);
      // if all items were already checked let's uncheck them all
      if (newitems.length === 0) {
        listcheck = false;
        items.forEach(item => {
          newitems.push(item.mergeDeep({ checked: false }));
        }, this);
      }
      let listOfShoppingListItems = this.props.shoppingListFactory.newListOfShoppingListItems(newitems);
      return this.props.shoppingListRepository.putItemsBulk(listOfShoppingListItems);
    }).then(newitemsresponse => {
      return this.props.shoppingListRepository.get(listid);
    }).then(shoppingList => {
      shoppingList = shoppingList.set("checked", listcheck);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(shoppingList => {
      this.getShoppingLists();
    });
  }

  /**
   * Delete a shopping list
   * @param {string} listid id of a shopping list
   */
  deleteShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set("_deleted", true);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(result => {
      this.getShoppingLists();
    });
  }

  /**
   * Create a new shopping list or item based on where the event came from
   * @param {event} evt The click event on the UI element requesting to the action. Get the name from state and decide whether to add a list or an item based on the `state.view` 
   */
  createNewShoppingListOrItem = (e) => {
    e.preventDefault();
    const { newName, view, shoppingList } = this.state;
    if (!newName.trim()) return;

    this.setState({ adding: false, newName: '' });

    if (view === 'lists') {
      const maxOrder = this.state.shoppingLists.reduce((max, list) => 
        Math.max(max, list.order !== undefined ? list.order : -1), -1);
      const newShoppingList = this.props.shoppingListFactory.newShoppingList({
        title: newName.trim(),
        order: maxOrder + 1,
      });
      this.props.shoppingListRepository.put(newShoppingList).then(this.getShoppingLists);
    } else if (view === 'items') {
      const newItem = this.props.shoppingListFactory.newShoppingListItem(
        { title: newName.trim() },
        shoppingList
      );
      this.props.shoppingListRepository.putItem(newItem)
        .then(() => this.getShoppingListItems(shoppingList._id))
        .then(items => this.setState({ shoppingListItems: items }));
    }
  };

  updateName = (e) => this.setState({ newName: e.target.value });

   /**
   * Tell the component we're in adding list or item mode
   */
   displayAddingUI = () => {
    this.setState({ adding: true });
  }
  renderNewNameUI = () => (
    <form onSubmit={this.createNewShoppingListOrItem} style={{ marginTop: '12px' }}>
      <Paper>
        <TextField
          autoFocus
          placeholder="Name..."
          value={this.state.newName}
          onChange={this.updateName}
          fullWidth
          style={{ padding: '0px 12px', width: 'calc(100% - 24px)' }}
        />
      </Paper>
    </form>
  );

  /**
   * Show UI for shopping lists
   */
  renderShoppingLists = () => {
    if (this.state.shoppingLists.length < 1) 
      return ( <Card style={{margin:"12px 0"}}><CardHeader title={NOLISTMSG} /></Card> );
    return (
      <ShoppingLists 
      shoppingLists={this.state.shoppingLists}
      openListFunc={this.openShoppingList} 
      deleteListFunc={this.deleteShoppingList} 
      renameListFunc={this.renameShoppingList} 
      checkAllFunc={this.checkAllListItems} 
      totalCounts={this.state.totalShoppingListItemCount}
      checkedCounts={this.state.checkedTotalShoppingListItemCount}
      updateListOrder={this.updateListOrder}
      setListsFunc={this.setLists}
    />

    )
  }

  /**
   * Show UI for shopping list items
   */
  renderShoppingListItems = () => {
    if (this.state.shoppingListItems?.size < 1) {
      return (
        <Card style={{ margin: "12px 0" }}>
          <CardHeader title={NOITEMSMSG} />
        </Card>
      );
    }
    return (
      <ShoppingList
        shoppingListItems={this.state.shoppingListItems}
        deleteFunc={this.deleteShoppingListItem}
        toggleItemCheckFunc={this.toggleItemCheck}
        renameItemFunc={this.renameShoppingListItem}
      />
    );
  };

  /**
   * If we're showing items from a shopping list, show a back button.  
   * If we're showing shopping lists, show a settings button.
   */
  renderBackButton = () => (
    <IconButton onClick={this.getShoppingLists}>
      <KeyboardBackspaceIcon />
    </IconButton>
  );

  renderActionButtons = () => (
    <>
      <IconButton onClick={this.toggleThemeMode} color="inherit">
        {this.state.themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      
      <IconButton onClick={() => this.setState({ settingsOpen: true })}>
        <SettingsIcon />
      </IconButton>
      <IconButton onClick={() => this.setState({ aboutOpen: true })}>
        <InfoOutlinedIcon />
      </IconButton>
    </>
  );

   /**
   * Tell component we want to show settings dialog
   */
   handleOpenSettings = () => {
    this.setState({ settingsOpen: true });
  }

  /**
   * Tell component we want to hide settings dialog
   */
  handleCloseSettings = () => {
    this.setState({ settingsOpen: false });
  }

  /**
   * Tell component we want to show about dialog
   */
  handleOpenAbout = () => {
    this.setState({ aboutOpen: true });
  }

  /**
   * Tell component we want to hide about dialog
   */
  handleCloseAbout = () => {
    this.setState({ aboutOpen: false });
  }

  /**
   * Right now the only setting is changing the remote DB, so do that then close the dialog
   */
  handleSubmitSettings = () => {
    try {
      localStorage.setItem("remoteUrl", this.tempdburl);
      this.tempdburl = localStorage.getItem("remoteUrl");
      this.remoteDB = new PouchDB(this.tempdburl);
      this.syncToRemote();
    }
    catch (ex) {
      console.log('Error setting remote database: ');
      console.log(ex);
    }
    try {
      if (this.state.settingsOpen) {
        this.handleCloseSettings();
      }
    } catch { }
  }

  /**
   * Show the UI
   */
  render() {
    const { adding, view, settingsOpen, aboutOpen } = this.state;

    return (
      <ThemeProvider theme={muiTheme}>
        <div className="App">
          <AppBar position="static" sx={{ backgroundColor: blueGrey[500] }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {view === 'items' ? this.renderBackButton() : <Typography variant="h6">Logo</Typography>}
              <Typography variant="h6">
                {view === 'items' ? this.state.shoppingList?.title : 'Shopping List'}
              </Typography>
              {this.renderActionButtons()}
            </Toolbar>
          </AppBar>

          <div className="listsanditems" style={{ margin: '8px' }}>
            {adding && this.renderNewNameUI()}
            {view === 'lists' ? (
              <ShoppingLists 
                shoppingLists={this.state.shoppingLists}
                openListFunc={this.openShoppingList} 
                deleteListFunc={this.deleteShoppingList} 
                renameListFunc={this.renameShoppingList} 
                checkAllFunc={this.checkAllListItems} 
                totalCounts={this.state.totalShoppingListItemCount}
                checkedCounts={this.state.checkedTotalShoppingListItemCount}
                updateListOrder={this.updateListOrder}
                setListsFunc={this.setLists}
              />            
            ) : (
              <ShoppingList 
                shoppingListItems={this.state.shoppingListItems} 
                deleteFunc={this.deleteShoppingListItem} 
                toggleItemCheckFunc={this.toggleItemCheck} 
                renameItemFunc={this.renameShoppingListItem}
              />
            )}
          </div>

          <Fab
            color="primary"
            size="small"
            sx={{ position: 'fixed', bottom: '25px', right: '25px' }}
            onClick={() => this.setState({ adding: true })}
          >
            <AddIcon />
          </Fab>

          {/* Settings Dialog */}
          <Dialog open={settingsOpen} onClose={this.handleCloseSettings}>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission behavior
                localStorage.setItem('remoteUrl', this.tempdburl); // Save remote URL
                this.handleCloseSettings(); // Close the dialog
              }}
            >
              <DialogTitle>Shopping List Settings</DialogTitle>
              <DialogContent>
                <p>
                  Enter a fully qualified URL (including username and password) to a remote IBM Cloudant,
                  Apache CouchDB, or PouchDB database to sync your shopping list.
                </p>
                <TextField
                  fullWidth
                  placeholder="https://username:password@localhost:5984/database"
                  onChange={(e) => (this.tempdburl = e.target.value)} // Update tempdburl state
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCloseSettings}>Cancel</Button>
                <Button type="submit" color="primary" variant="contained" onClick={this.handleSubmitSettings}>
                  Submit
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* About Dialog */}
          <Dialog open={aboutOpen} onClose={() => this.setState({ aboutOpen: false })}>
            <DialogTitle>About</DialogTitle>
            <DialogContent>
              Shopping List is a Progressive Web App built using React and PouchDB.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ aboutOpen: false })}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
