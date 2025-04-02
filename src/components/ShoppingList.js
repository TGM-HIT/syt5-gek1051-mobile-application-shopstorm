import React from 'react';
import { ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share'; // Imported for shared list indicator
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './ShoppingList.css';

class ShoppingList extends React.Component {
  state = {
    open: false,           // Controls the rename dialog
    activeItemId: '',      // ID of the item being renamed
    oldName: '',           // Original name of the item
    newName: '',           // New name entered by the user
    anchorEl: null,        // Anchor element for the menu
  };

  // Opens the rename dialog with the item's ID and current title
  handleOpen = (itemId, itemTitle) => {
    this.setState({ open: true, activeItemId: itemId, oldName: itemTitle });
  };

  // Closes the rename dialog
  handleClose = () => {
    this.setState({ open: false });
  };

  // Submits the new name for the item
  handleSubmit = () => {
    const { activeItemId, newName } = this.state;

    if (!activeItemId || typeof activeItemId !== 'string') {
      console.error('Invalid _id:', activeItemId);
      return;
    }

    this.props.renameItemFunc(activeItemId, newName);
    this.handleClose();
  };

  // Updates the newName state as the user types
  updateName = (e) => {
    this.setState({ newName: e.target.value });
  };

  // Opens the menu when the MoreVertIcon is clicked
  handleMenuOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  // Closes the menu
  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { shoppingListItems, toggleItemCheckFunc, deleteFunc, shared } = this.props; // Added shared prop
    const { open, oldName, anchorEl } = this.state;

    // Define the dialog actions (Cancel and Submit buttons)
    const actions = (
      <>
        <Button onClick={this.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={this.handleSubmit} color="primary" variant="contained">
          Submit
        </Button>
      </>
    );

    // Map over shopping list items to create the UI
    const items = shoppingListItems.map((item) => {
      if (!item || !item._id || typeof item._id !== 'string') {
        console.error('Invalid shopping list item:', item);
        return null;
      }

      return (
        <div key={`listitem_${item._id}`}>
          <ListItem className="shoppinglistitem">
            <ListItemIcon>
              <Checkbox
                checked={item.checked}
                onChange={(e) => toggleItemCheckFunc(e)}
                inputProps={{ 'data-id': item._id }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <span className={item.checked ? 'checkeditem' : 'uncheckeditem'}>
                  {item.title}
                </span>
              }
            />
            <IconButton onClick={this.handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleMenuClose}
            >
              <MenuItem onClick={() => this.handleOpen(item._id, item.title)}>
                Rename
              </MenuItem>
              <MenuItem onClick={() => deleteFunc(item._id)}>Delete</MenuItem>
            </Menu>
          </ListItem>
          <Divider />
        </div>
      );
    });

    return (
      <div>
        {/* Display ShareIcon if the list is shared */}
        {shared && <ShareIcon style={{ marginRight: '8px' }} />}
        {items}
        <Dialog open={open} onClose={this.handleClose} id={this._id}>
          <DialogTitle>Rename Item</DialogTitle>
          <DialogContent>
            <TextField
              className="form-control"
              type="text"
              id="textfield-item-rename"
              defaultValue={oldName}
              onChange={this.updateName}
              fullWidth
            />
          </DialogContent>
          <DialogActions>{actions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default ShoppingList;