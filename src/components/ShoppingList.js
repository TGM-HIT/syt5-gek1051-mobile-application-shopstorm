import React from 'react';
import { ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button'; // FlatButton replaced with Button
import TextField from '@mui/material/TextField';
import './ShoppingList.css';

class ShoppingList extends React.Component {
  state = {
    open: false,
    activeItemId: '',
    oldName: '',
    newName: '',
    anchorEl: null, // For handling menu
  };

  handleOpen = (itemId, itemTitle) => {
    this.setState({ open: true, activeItemId: itemId, oldName: itemTitle });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    const { activeItemId, newName } = this.state;

    if (!activeItemId || typeof activeItemId !== 'string') {
      console.error('Invalid _id:', activeItemId);
      return;
    }

    this.props.renameItemFunc(activeItemId, newName);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({ newName: e.target.value });
  };

  handleMenuOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { shoppingListItems, toggleItemCheckFunc, deleteFunc } = this.props;
    const { open, oldName, anchorEl } = this.state;

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
        {items}
        <Dialog open={open} onClose={this.handleClose} id={this._id}>
          {/* Dialog content */}
          <Dialog.Title>Rename Item</Dialog.Title>
          <Dialog.Content>
            <TextField
              className="form-control"
              type="text"
              id="textfield-item-rename"
              defaultValue={oldName}
              onChange={this.updateName}
              fullWidth
            />
          </Dialog.Content>
          <Dialog.Actions>{actions}</Dialog.Actions>
        </Dialog>
      </div>
    );
  }
}

export default ShoppingList;
