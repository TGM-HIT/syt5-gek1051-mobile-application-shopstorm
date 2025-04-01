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

  handleOpen = (itemId, itemTitle, itemTag) => {
    console.log("Dialog opened with tag:", itemTag); // Debugging
    this.setState({
      open: true,
      activeItemId: itemId,
      oldName: itemTitle,
      selectedTag: itemTag || '' // Initialisiere mit vorhandenem Tag
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    const { activeItemId, newName, selectedTag } = this.state;
    if (!activeItemId || typeof activeItemId !== 'string') {
      console.error('Invalid _id:', activeItemId);
      return;
    }

    this.props.renameItemFunc(activeItemId, newName, selectedTag)
      .then(() => {
        this.setState({
          open: false,
          selectedTag: '',
          newName: ''
        });
      })
      .catch(err => {
        console.error('Error updating item:', err);
        alert('Fehler beim Speichern des Tags');
      });
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

      // Berechne den Tagname innerhalb der map-Funktion
      const tagValue = item.get('tag') || ''; // Falls `tag` undefined ist, wird es zu einem leeren String
      const tagName = AVAILABLE_TAGS.find(tag => tag.id === tagValue)?.label || 'Kein Tag';

      console.log(item.get('tag')?.toString())
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: '500' }}>{item.title}</span>
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
              <MenuItem onClick={() => this.handleOpen(item._id, item.get('title'), item.get('tag'))}>
                Rename
              </MenuItem>
              <MenuItem onClick={() => deleteFunc(item._id)}>
                Delete
              </MenuItem>
            </Menu>
            <Divider />
          </ListItem>
        </div>
      );
    });

    return (
      <div>
        {items}
        <Dialog open={open} onClose={this.handleClose} id={this._id}>
          <DialogTitle>Artikel bearbeiten</DialogTitle>
          <DialogContent>
            <TextField
              className="form-control"
              type="text"
              id="textfield-item-rename"
              defaultValue={oldName}
              onChange={this.updateName}
              fullWidth
              label="Artikelname"
            />

            {/* Neues Select für Tags */}
            <FormControl fullWidth style={{ marginTop: '16px' }}>
              <InputLabel id="tag-select-label">Tag auswählen</InputLabel>
              <Select
                labelId="tag-select-label"
                id="tag-select"
                value={this.state.selectedTag}
                onChange={this.handleTagChange}
                label="Tag"
              >
                <MenuItem value="">
                  <em>Kein Tag ausgewählt</em>
                </MenuItem>
                {AVAILABLE_TAGS.map(tag => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>{actions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default ShoppingList;
