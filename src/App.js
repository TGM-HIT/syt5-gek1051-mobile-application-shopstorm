import React from 'react';
import {List} from 'immutable';
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

import PouchDB from 'pouchdb';

import ShoppingLists from './components/ShoppingLists';
import ShoppingList from './components/ShoppingList';

// create a custom color scheme for Material-UI
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

const NOLISTMSG = "Click the + sign below to create a shopping list."
const NOITEMSMSG = "Click the + sign below to create a shopping list item."

/** 
 * This is the main React application
 */
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


    this.state = {
      shoppingList: null, 
      shoppingLists: [], 
      totalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      checkedTotalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      shoppingListItems: null, 
      adding: false, 
      view: 'lists',
      newName: '',
      settingsOpen: false,
      aboutOpen: false
    }
  }

  /**
   * Before this component shows the user anything, get the data from the local PouchDB
   * 
   * Then, if we were initialized with a remote DB, synchronize with it
   */
  componentDidMount = () => {
      this.getShoppingLists();
      if (this.remoteDB) {
        this.syncToRemote();
      }
  }

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

  /**
   * Synchronize local PouchDB with a remote CouchDB or Cloudant
   */
  
  syncToRemote = () => {
    this.props.localDB.sync(this.remoteDB, { live: true, retry: true })
      .on('change', change => {
        console.log('Change detected during sync:', change);
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
        console.log('Conflicts detected for document:', doc._id);
        this.resolveConflict(doc);
      } else {
        
      }
    });
  };

  resolveConflict = (doc) => {
    this.props.localDB.get(doc._id, { conflicts: true })
      .then(conflictedDoc => {
        console.log('Resolving conflicts for:', conflictedDoc);

        const losingRevisions = conflictedDoc._conflicts;

        const deletePromises = losingRevisions.map(rev =>
          this.props.localDB.remove(conflictedDoc._id, rev)
        );

        return Promise.all(deletePromises).then(() => {
          console.log(`Resolved conflicts for document: ${conflictedDoc._id}`);
          this.getShoppingLists();
        });
      })
    .catch(err => console.error('Error resolving conflict:', err));
  };

  /**
   * From the local DB, load all the shopping lists and item counts and which are checked
   */
  getShoppingLists = () => {
    let checkedCount = List();
    let totalCount = List();
    let lists = null;
    
    return this.props.shoppingListRepository
      .find()
      .then((foundLists) => {
          lists = foundLists.sort((a, b) => {
              const savedOrder = JSON.parse(localStorage.getItem('shoppingListOrder') || '[]');
              
              // Get index from saved order, or fall back to natural ordering
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

  /**
   * Update the order of shopping lists
   * @param {Array} reorderedLists The new order of shopping lists
   */
  updateListOrder = (reorderedLists) => {
    // Validate reorderedLists array
    if (!Array.isArray(reorderedLists) || reorderedLists.length === 0) {
      console.error('Invalid list array for reordering');
      return;
    }
  
    // Filter out any invalid list items (those without a valid _id)
    const validLists = reorderedLists.filter(list => {
      return list && list._id && typeof list._id === 'string' && list._id.startsWith('list:');
    });
    
    // Create a map of list IDs to their new positions
    const orderMap = new Map();
    validLists.forEach((list, index) => {
      orderMap.set(list._id, index);
    });
  
    // Log for debugging
    console.log('Updating list order for:', validLists.map(list => list._id));
  
    // Update each list with its new order value
    const updatePromises = validLists.map((list) => {
      const listId = list._id;
      
      // Additional validation for list ID format
      if (!listId || typeof listId !== 'string' || !listId.startsWith('list:')) {
        console.warn(`Skipping list with invalid ID format: ${listId}`);
        return Promise.resolve();
      }
      
      return this.props.shoppingListRepository.get(listId)
        .then(shoppingList => {
          if (!shoppingList) {
            console.warn(`List with ID ${listId} not found`);
            return Promise.resolve();
          }
          shoppingList = shoppingList.set('order', orderMap.get(listId));
          return this.props.shoppingListRepository.put(shoppingList);
        })
        .catch(err => {
          console.error(`Error updating order for list ${listId}:`, err);
          return Promise.resolve(); // Continue with other updates even if one fails
        });
    });
  
    // After all updates are complete, refresh the lists
    Promise.all(updatePromises)
      .then(() => {
        this.getShoppingLists();
      })
      .catch(err => {
        console.error('Error updating list order:', err);
        this.getShoppingLists(); // Refresh lists anyway to maintain UI consistency
      });
  };

  /**
   * Get a shopping list by id 
   * @param {string} listid id of a shopping list
   */
  openShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then( list => {
      return list;
    }).then(list => {
      this.getShoppingListItems(listid).then(items => {
        this.setState({
          view: 'items', 
          shoppingList: list,
          shoppingListItems: items
        });
      });
    });
  }

  setLists = (lists) => {
    this.setState({shoppingLists: lists});
  }

  /**
   * Get the items in a shopping list
   * @param {string} listid id of a shopping list
   */
  getShoppingListItems = (listid) => {
    return this.props.shoppingListRepository.findItems({
      selector: {
        type: 'item', 
        list: listid
      }
    });
  }

  /**
   * Refresh the items in a shopping list
   * @param {string} listid id of a shopping list
   */
  refreshShoppingListItems = (listid) => {
    this.props.shoppingListRepository.findItems({
      selector: {
        type: 'item', 
        list: listid
      }
    }).then(items => {
      this.setState({
        view: 'items', 
        shoppingListItems: items
      });
    });
  }

  /**
   * Change the name of an item
   * @param {string} itemid id of an item
   * @param {string} newname new name of the item
   */
  renameShoppingListItem = (itemid, newname) => {
    console.log('IN renameShoppingListItem with id='+itemid+', name='+newname);

    if (!itemid || typeof itemid !== 'string') {
      console.error('Invalid item ID:', itemId);
      return;
    }

    this.props.shoppingListRepository.getItem(itemid).then(item => {
      item = item.set('title', newname);
      return this.props.shoppingListRepository.putItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }


  /**
   * Delete an item
   * @param {string} itemid id of an item
   */
  deleteShoppingListItem = (itemid) => {
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      return this.props.shoppingListRepository.deleteItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  /**
   * Check off or un-check an item
   * @param {event} evt The click event on the UI element requesting to toggle state. It's id is the item id
   */
  toggleItemCheck = (evt) => {
    const itemid = evt.target.dataset.id;

    // Validate that itemid exists and is a string
    if (!itemid || typeof itemid !== 'string') {
      console.error('Invalid _id:', itemid);
      return;
    }

    this.props.shoppingListRepository.getItem(itemid)
    .then((item) => {
      // Toggle the 'checked' state of the item
      item = item.set('checked', !item.checked);
      return this.props.shoppingListRepository.putItem(item);
    })
    .then(() => this.refreshShoppingListItems(this.state.shoppingList._id))
    .catch((err) => console.error('Error toggling item check:', err));
  }

  /**
   * Check off all items in the shopping list
   * @param {string} listid id of a shopping list
   */
  checkAllListItems = (listid) => {
    let listcheck = true;
    this.getShoppingListItems(listid).then( items => {
      let newitems = [];
      items.forEach(item => {
        if (!item.checked) {
          newitems.push( item.mergeDeep({checked:true}) );
        }
      }, this);
      // if all items were already checked let's uncheck them all
      if (newitems.length === 0) {
        listcheck = false;
        items.forEach(item => {
          newitems.push( item.mergeDeep({checked:false}) );
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
   * Change the name of a shopping list
   * @param {string} listid id of a shopping list
   * @param {string} newname new name of the list
   */
  renameShoppingList = (listid, newname) => {

    if (!listid || typeof listid !== 'string') {
      console.error('Invalid list ID:', listId);
      return;
    }

    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set('title', newname);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(this.getShoppingLists);
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
      // Find the highest order number currently in use
      const maxOrder = this.state.shoppingLists.reduce((max, list) => {
        return list.order !== undefined && list.order > max ? list.order : max;
      }, -1);
      
      const newShoppingList = this.props.shoppingListFactory.newShoppingList({
        title: newName.trim(),
        order: maxOrder + 1, // Set new list to appear at the end
      });
      this.props.shoppingListRepository.put(newShoppingList).then(this.getShoppingLists);
    } else if (view === 'items') {
      const newItem = this.props.shoppingListFactory.newShoppingListItem(
        { title: newName.trim() },
        shoppingList
      );
      this.props.shoppingListRepository.putItem(newItem).then(() => {
        this.getShoppingListItems(shoppingList._id).then((items) => {
          this.setState({ shoppingListItems: items });
        });
      });
    }
  };

  /**
   * Set the new name the user has typed in state for pickup later by other functions
   * @param {event} evt The change event on the UI element that let's user type a name
   */
  updateName = (e) => {
    this.setState({ newName: e.target.value });
  };

  /**
   * Tell the component we're in adding list or item mode
   */
  displayAddingUI = () => {
    this.setState({adding: true});
  }

  /**
   * Show UI for typing in a new name
   */
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
    if (this.state.shoppingListItems.size < 1) 
      return ( <Card style={{margin:"12px 0"}}><CardHeader title={NOITEMSMSG} /></Card> );
    return (
      <ShoppingList 
        shoppingListItems={this.state.shoppingListItems} 
        deleteFunc={this.deleteShoppingListItem} 
        toggleItemCheckFunc={this.toggleItemCheck} 
        renameItemFunc={this.renameShoppingListItem}
      />
    )
  }

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
    this.setState({settingsOpen: true});
  }

  /**
   * Tell component we want to hide settings dialog
   */
  handleCloseSettings = () => {
    this.setState({settingsOpen: false});
  }

  /**
   * Tell component we want to show about dialog
   */
  handleOpenAbout = () => {
    this.setState({aboutOpen: true});
  }

  /**
   * Tell component we want to hide about dialog
   */
  handleCloseAbout = () => {
    this.setState({aboutOpen: false});
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
    } catch {}
  }

  /**
   * Show the UI
   */
  render() {
    const { adding, view, settingsOpen, aboutOpen } = this.state;

    return (
      <ThemeProvider theme={muiTheme}>
        <div className="App">
          {/* AppBar */}
          <AppBar position="static" sx={{ backgroundColor: blueGrey[500] }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {view === 'items' ? this.renderBackButton() : <Typography variant="h6">Logo</Typography>}
              <Typography variant="h6">
                {view === 'items' ? this.state.shoppingList?.title : 'Shopping List'}
              </Typography>
              {this.renderActionButtons()}
            </Toolbar>
          </AppBar>

          {/* Main Content */}
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

          {/* Floating Action Button */}
          <Fab
            color="primary"
            size="small"
            sx={{ position: 'fixed', bottom: '25px', right: '25px' }}
            onClick={() => this.setState({ adding: true })}
            id='add'
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
