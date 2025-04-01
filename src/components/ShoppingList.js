import React from 'react';
import { ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, Select } from '@mui/material';
import './ShoppingList.css';

const AVAILABLE_TAGS = [
  { id: 'fruits_vegetables', label: 'Obst & Gemüse' },
  { id: 'fresh_counter', label: 'Frischetheke' },
  { id: 'dairy_cooling', label: 'Molkerei & Kühlprodukte' },
  { id: 'frozen_food', label: 'Tiefkühlprodukte' },
  { id: 'dry_goods', label: 'Trockenwaren' },
  { id: 'beverages', label: 'Getränke' },
  { id: 'sweets_snacks', label: 'Süßwaren & Snacks' },
  { id: 'non_food', label: 'Non-Food' }
];

class ShoppingList extends React.Component {
  state = {
    open: false,
    activeItemId: '',
    oldName: '',
    newName: '',
    anchorEl: null,
    selectedTag: ''
  };

  handleOpen = (itemId, itemTitle) => {
    const [name = '', tag = ''] = itemTitle.split('$');
    this.setState({
      open: true,
      activeItemId: itemId,
      oldName: name,
      newName: name,
      selectedTag: tag
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    const { activeItemId, newName, selectedTag } = this.state;
    this.props.renameItemFunc(activeItemId, newName, selectedTag)
      .then(this.handleClose)
      .catch(err => console.error('Error updating item:', err));
  };

  updateName = (e) => {
    this.setState({ newName: e.target.value });
  };

  handleTagChange = (e) => {
    this.setState({ selectedTag: e.target.value });
  };

  handleMenuOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { shoppingListItems, toggleItemCheckFunc, deleteFunc } = this.props;
    const { open, anchorEl, newName, selectedTag } = this.state;

    return (
      <div>
        {shoppingListItems.map((item) => {
          const [name = '', tag = ''] = item.title.split('$');
          const tagName = AVAILABLE_TAGS.find(t => t.id === tag)?.label || 'Kein Tag';

          return (
            <div key={item._id}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: '500' }}>{name}</span>
                      <span style={{
                        backgroundColor: '#f5f5f5',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {tagName}
                      </span>
                    </div>
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
                    Umbenennen
                  </MenuItem>
                  <MenuItem onClick={() => deleteFunc(item._id)}>
                    Löschen
                  </MenuItem>
                </Menu>
              </ListItem>
              <Divider />
            </div>
          );
        })}

        <Dialog open={open} onClose={this.handleClose}>
          <DialogTitle>Artikel bearbeiten</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Artikelname"
              value={newName}
              onChange={this.updateName}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={selectedTag}
                onChange={this.handleTagChange}
                label="Kategorie"
              >
                {AVAILABLE_TAGS.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Abbrechen</Button>
            <Button onClick={this.handleSubmit} color="primary">
              Speichern
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default ShoppingList;