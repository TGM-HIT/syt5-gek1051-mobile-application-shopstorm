import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Card, CardContent, CardActions, Box, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './ShoppingLists.css';

class ShoppingLists extends React.Component {
  state = {
    open: false,
    activeListId: '',
    oldName: '',
    newName: '',
    anchorEl: null,
    currentMenuListId: null, // Track which list's menu is open
  };

  handleOpen = (listId, listTitle) => {
    this.setState({ open: true, activeListId: listId, oldName: listTitle });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    this.props.renameListFunc(this.state.activeListId, this.state.newName);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({ newName: e.target.value });
  };

  handleMenuOpen = (event, listId) => {
    this.setState({ 
      anchorEl: event.currentTarget,
      currentMenuListId: listId
    });
  };

  handleMenuClose = () => {
    this.setState({ 
      anchorEl: null,
      currentMenuListId: null
    });
  };

  render() {
    const { shoppingLists, openListFunc, deleteListFunc, checkAllFunc, checkedCounts, totalCounts } = this.props;
    const { open, oldName, anchorEl, currentMenuListId } = this.state;

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

    const listItems = shoppingLists.map((list) => {
      // Guard against invalid lists
      if (!list || !list._id) return null;

      return (
        <Card key={list._id} sx={{ margin: '12px 0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">{list.title}</Typography>
              <IconButton onClick={(e) => this.handleMenuOpen(e, list._id)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && currentMenuListId === list._id}
                onClose={this.handleMenuClose}
              >
                <MenuItem onClick={() => openListFunc(list._id)}>Open</MenuItem>
                <MenuItem onClick={() => this.handleOpen(list._id, list.title)}>Rename</MenuItem>
                <MenuItem onClick={() => deleteListFunc(list._id)}>Delete</MenuItem>
              </Menu>
            </Box>
          </CardContent>
          <CardActions>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={list.checked}
                onChange={() => checkAllFunc(list._id)}
                inputProps={{ 'aria-label': 'Check all items' }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {`${checkedCounts.get(list._id, 0)} of ${totalCounts.get(list._id, 0)} items checked`}
              </Typography>
            </Box>
          </CardActions>
        </Card>
      );
    });

    return (
      <div>
        {listItems}
        <Dialog open={open} onClose={this.handleClose}>
          <Dialog.Title>Rename List</Dialog.Title>
          <Dialog.Content>
            <TextField
              className="form-control"
              type="text"
              id="textfield-list-rename"
              defaultValue={oldName}
              onChange={this.updateName}
              fullWidth
              sx={{ mt: 2 }}
            />
          </Dialog.Content>
          <Dialog.Actions>{actions}</Dialog.Actions>
        </Dialog>
      </div>
    );
  }
}

ShoppingLists.propTypes = {
  shoppingLists: PropTypes.array.isRequired,
  deleteListFunc: PropTypes.func.isRequired,
  openListFunc: PropTypes.func.isRequired,
  renameListFunc: PropTypes.func.isRequired,
  checkAllFunc: PropTypes.func.isRequired,
  checkedCounts: PropTypes.instanceOf(List),
  totalCounts: PropTypes.instanceOf(List),
};

ShoppingLists.defaultProps = {
  checkedCounts: List(),
  totalCounts: List(),
};

export default ShoppingLists;
