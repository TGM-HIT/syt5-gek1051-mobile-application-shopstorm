import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Card, CardContent, CardActions, Box, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ShareIcon from '@mui/icons-material/Share'; // Add ShareIcon
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { v4 as uuidv4 } from 'uuid'; // Add UUID
import './ShoppingLists.css';
import { useContext } from 'react';
import { DBContext } from './DBContext';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableShoppingListItem = ({ list, openListFunc, handleMenuOpen, checkAllFunc, checkedCounts, totalCounts, handleShare }) => {
  if (!list || !list._id || typeof list._id !== 'string') {
    console.error('Invalid list for sortable item:', list);
    return null;
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card ref={setNodeRef} style={style} sx={{ margin: '12px 0' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              {...attributes}
              {...listeners}
              sx={{ cursor: 'grab', marginRight: '8px', display: 'flex', alignItems: 'center', touchAction: 'none' }}
            >
              <DragIndicatorIcon />
            </Box>
            <Typography variant="body1">{list.title}</Typography>
          </Box>
          <Box>
            <IconButton onClick={() => handleShare(list._id)}>
              <ShareIcon />
            </IconButton>
            <IconButton onClick={(e) => handleMenuOpen(e, list._id)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
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
};

const ShoppingLists = (props) => {
  const { localDB } = useContext(DBContext);
  const {
    shoppingLists,
    openListFunc,
    deleteListFunc,
    renameListFunc,
    checkAllFunc,
    checkedCounts,
    totalCounts,
    updateListOrder,
    setListsFunc,
  } = props;

  const [open, setOpen] = useState(false);
  const [activeListId, setActiveListId] = useState('');
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMenuListId, setCurrentMenuListId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(shoppingLists);
  const [shareDialogOpen, setShareDialogOpen] = useState(false); // New state for share dialog
  const [shareListId, setShareListId] = useState(''); // New state for sharing list

  React.useEffect(() => {
    const orderedLists = loadSavedOrder(shoppingLists);
    setItems(orderedLists);
  }, [shoppingLists]);

  React.useEffect(() => {
    setItems(shoppingLists);
  }, [shoppingLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpen = (listId, listTitle) => {
    setOpen(true);
    setActiveListId(listId);
    setOldName(listTitle);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    renameListFunc(activeListId, newName);
    handleClose();
  };

  const updateName = (e) => {
    setNewName(e.target.value);
  };

  const handleMenuOpen = (event, listId) => {
    setAnchorEl(event.currentTarget);
    setCurrentMenuListId(listId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentMenuListId(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeIndex = shoppingLists.findIndex((list) => list._id === active.id);
    const overIndex = shoppingLists.findIndex((list) => list._id === over.id);

    if (activeIndex !== overIndex) {
      const updatedLists = List(arrayMove(shoppingLists.toArray(), activeIndex, overIndex));
      setListsFunc(updatedLists);
      updateListOrder(updatedLists);
      const orderArray = updatedLists.map((list) => list._id);
      localStorage.setItem('shoppingListOrder', JSON.stringify(orderArray));
    }
  };

  const loadSavedOrder = (lists) => {
    const savedOrder = localStorage.getItem('shoppingListOrder');
    if (savedOrder) {
      const orderArray = JSON.parse(savedOrder);
      return List(orderArray.map((id) => lists.find((list) => list._id === id)).filter(Boolean));
    }
    return lists;
  };

  const handleShare = (listId) => {
    setShareListId(listId);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async (shareName) => {
    const shareId = uuidv4();
    const shareDoc = {
      _id: `share:${shareId}`,
      type: 'share',
      listId: shareListId,
      name: shareName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 1 day expiration
    };

    try {
      console.log(localDB)
      await localDB.put(shareDoc);
      console.log("Success");
      const shareLink = `${window.location.origin}/shared/${shareId}`;
      alert(`Share this link: ${shareLink}`);
      setShareDialogOpen(false);
    } catch (err) {
      console.error('Error creating share link:', err);
      alert('Failed to create share link.');
    }
  };

  const renderList = () => (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={shoppingLists.map((list) => list._id)} strategy={verticalListSortingStrategy}>
        {items.map((list) => {
          if (!list || !list._id) return null;

          return (
            <React.Fragment key={list._id}>
              <SortableShoppingListItem
                list={list}
                openListFunc={openListFunc}
                handleMenuOpen={handleMenuOpen}
                checkAllFunc={checkAllFunc}
                checkedCounts={checkedCounts}
                totalCounts={totalCounts}
                handleShare={handleShare}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && currentMenuListId === list._id}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { openListFunc(list._id); handleMenuClose(); }}>Open</MenuItem>
                <MenuItem onClick={() => { handleOpen(list._id, list.title); handleMenuClose(); }}>Rename</MenuItem>
                <MenuItem onClick={() => { deleteListFunc(list._id); handleMenuClose(); }}>Delete</MenuItem>
              </Menu>
            </React.Fragment>
          );
        })}
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <Card sx={{ margin: '12px 0', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DragIndicatorIcon sx={{ marginRight: '8px' }} />
                <Typography>{items.find((item) => item._id === activeId)?.title || 'List'}</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  return (
    <div>
      {renderList()}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Rename List</DialogTitle>
        <DialogContent>
          <TextField
            className="form-control"
            type="text"
            id="textfield-list-rename"
            defaultValue={oldName}
            onChange={updateName}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share List</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter a name for this share"
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)} color="primary">Cancel</Button>
          </DialogActions>
          <DialogActions>
            <Button onClick={(e) => handleShareSubmit(e.target.value)} color="primary">Share</Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

ShoppingLists.propTypes = {
  shoppingLists: PropTypes.array.isRequired,
  deleteListFunc: PropTypes.func.isRequired,
  openListFunc: PropTypes.func.isRequired,
  renameListFunc: PropTypes.func.isRequired,
  checkAllFunc: PropTypes.func.isRequired,
  updateListOrder: PropTypes.func.isRequired,
  checkedCounts: PropTypes.instanceOf(List),
  totalCounts: PropTypes.instanceOf(List),
  setListsFunc: PropTypes.func.isRequired,
};

ShoppingLists.defaultProps = {
  checkedCounts: List(),
  totalCounts: List(),
  updateListOrder: null,
};

export default ShoppingLists;