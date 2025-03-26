import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardActions, CardTitle } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import './ShoppingLists.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const iconButtonElement = (
  <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
    <MoreVertIcon />
  </IconButton>
);

class ShoppingLists extends React.Component {
  // all state actions are for handling the renaming dialog
  state = {
    open: false,
    activeListId: '',
    oldName: '',
    newName: '',
    newTag: ''
  };

  handleOpen = (listid, listtitle, listtag) => {
    this.setState({
      open: true,
      activeListId: listid,
      oldName: listtitle,
      newName: listtitle,
      oldTag: listtag || '',
      newTag: listtag || ''
    });
  };

  updateTag = (e) => {
    this.setState({ newTag: e.target.value });
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = (e) => {
    this.props.renameListFunc(this.state.activeListId, this.state.newName, this.state.newTag);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({ newName: e.target.value });
  }

  /**
   * Show the UI. The most important thing happening here is that the UI elements 
   * make use of the functions passed into the component as props to do all the heavy 
   * lifting of manipulating shopping lists, so this component is pure UI.
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

    let listItems = this.props.shoppingLists.map((list) =>
      <Card key={list._id} style={{ margin: "12px 0" }}>
        <CardTitle
          title={
            <div>
              {list.title}
              {list.tag && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>{list.tag}</span>}
            </div>
          }
          children={
            <IconMenu iconButtonElement={iconButtonElement}
              className="vertmenu-list">
              <MenuItem
                primaryText="Open"
                onClick={() => this.props.openListFunc(list._id)} />
              <MenuItem
                primaryText="Rename"
                onClick={() => this.handleOpen(list._id, list.title, list.tag)} />
              <MenuItem
                primaryText="Delete"
                onClick={() => this.props.deleteListFunc(list._id)} />
            </IconMenu>
          } />
        <CardActions>
          <Checkbox label={(this.props.checkedCounts.get(list._id) || 0) + ' of ' + (this.props.totalCounts.get(list._id) || 0) + ' items checked'}
            checked={list.checked}
            onCheck={() => this.props.checkAllFunc(list._id)} />
        </CardActions>
      </Card>
    )
    return (
      <div>
        <div>{listItems}</div>
        <Dialog
          title="Liste bearbeiten"
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

ShoppingLists.propTypes = {
  shoppingLists: PropTypes.array.isRequired, 
  deleteFunc: PropTypes.func.isRequired, 
  openListFunc: PropTypes.func.isRequired, 
  renameListFunc: PropTypes.func.isRequired,
  checkAllFunc: PropTypes.func.isRequired,
  checkedCounts: PropTypes.object.isRequired,
  totalCounts: PropTypes.object.isRequired
}

export default ShoppingLists;