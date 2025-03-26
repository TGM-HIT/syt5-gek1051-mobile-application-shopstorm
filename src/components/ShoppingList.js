import React from 'react';
import { ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import './ShoppingList.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const moveVertButton = (
  <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
    <MoreVertIcon />
  </IconButton>
);

class ShoppingList extends React.Component {
  /* all state actions are for handling the renaming dialog */
  state = {
    open: false,
    activeItemId: '',
    oldName: '',
    newName: '',
    newTag: ''
  };

  handleOpen = (itemid, itemtitle, itemtag) => {
    this.setState({
      open: true,
      activeItemId: itemid,
      oldName: itemtitle,
      newName: itemtitle,
      oldTag: itemtag || '',
      newTag: itemtag || ''
    });
  };

  updateTag = (e) => {
    this.setState({ newTag: e.target.value });
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = (e) => {
    this.props.renameItemFunc(this.state.activeItemId, this.state.newName, this.state.newTag);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({ newName: e.target.value });
  }

  /**
   * Show the UI. The most important thing happening here is that the UI elements 
   * make use of the functions passed into the component as props to do all the heavy 
   * lifting of manipulating shopping list items, so this component is pure UI.
   */
  render() {
    /* rename dialog stuff */
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit}
      />,
    ];
    /* end rename dialog stuff */

    let items = this.props.shoppingListItems.map((item) =>
      <div key={'listitem_' + item._id}>
        <ListItem className='shoppinglistitem'
          primaryText={
            <div>
              <span className={(item.checked ? 'checkeditem' : 'uncheckeditem')}>{item.title}</span>
              <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>{item.tag}</span>
            </div>}
          leftCheckbox={
            <Checkbox onCheck={this.props.toggleItemCheckFunc} data-item={item._id} data-id={item._id} checked={item.checked} />}
          rightIconButton={
            <IconMenu iconButtonElement={moveVertButton}
              className="vertmenu-list">
              <MenuItem
                primaryText="Rename"
                onClick={() => this.handleOpen(item._id, item.title, item.tag)} />
              <MenuItem
                primaryText="Delete"
                onClick={() => this.props.deleteFunc(item._id)} />
            </IconMenu>
          }>
        </ListItem>
        <Divider inset={true} />
      </div>
    );

    return (
      <div>
        <div>{items}</div>
        <Dialog
          title="Item bearbeiten"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
          <TextField
            label="Name"
            defaultValue={this.state.oldName}
            onChange={this.updateName}
            fullWidth={true}
            style={{ marginBottom: '20px' }} />
          <TextField
            label="Tag"
            defaultValue={this.state.oldTag}
            onChange={this.updateTag}
            fullWidth={true} />
        </Dialog>
      </div>
    )
  }
}

export default ShoppingList;