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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './ShoppingLists.css';

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

// Sortable shopping list item component
const SortableShoppingListItem = ({ list, openListFunc, handleMenuOpen, checkAllFunc, checkedCounts, totalCounts }) => {
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
    <Card 
      ref={setNodeRef} 
      style={style} 
      sx={{ margin: '12px 0' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              {...attributes}
              {...listeners}
              sx={{ 
                cursor: 'grab', 
                marginRight: '8px', 
                display: 'flex', 
                alignItems: 'center',
                touchAction: 'none' 
              }}
            >
              <DragIndicatorIcon />
            </Box>
            <Typography variant="body1">{list.title}</Typography>
          </Box>
          <IconButton onClick={(e) => handleMenuOpen(e, list._id)}>
            <MoreVertIcon />
          </IconButton>
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

// Main ShoppingLists component
const ShoppingLists = (props) => {
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

  React.useEffect(() => {
    const orderedLists = loadSavedOrder(shoppingLists);
    setItems(orderedLists);
  }, [shoppingLists]);

  // Update local items state when props change
  React.useEffect(() => {
    setItems(shoppingLists);
  }, [shoppingLists]);

  // Define sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);  
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
  
    const activeIndex = shoppingLists.findIndex(list => list._id === active.id);
    const overIndex = shoppingLists.findIndex(list => list._id === over.id);
    
    if (activeIndex !== overIndex) {
      const updatedLists = List(arrayMove(
        shoppingLists.toArray(),
        activeIndex,
        overIndex
      ));
      
      setListsFunc(updatedLists);
      updateListOrder(updatedLists);
      
      // Save the updated order to localStorage
      const orderArray = updatedLists.map(list => list._id);
      localStorage.setItem('shoppingListOrder', JSON.stringify(orderArray));
    }
  };

  const loadSavedOrder = (lists) => {
    const savedOrder = localStorage.getItem('shoppingListOrder');
    if (savedOrder) {
      const orderArray = JSON.parse(savedOrder);
      return List(orderArray.map(id => lists.find(list => list._id === id)).filter(Boolean));
    }
    return lists;
  };  
  

  const renderList = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={shoppingLists.map(list => list._id)} 
        strategy={verticalListSortingStrategy}
      >
        {items.map((list, index) => {
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
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && currentMenuListId === list._id}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { openListFunc(list._id); handleMenuClose(); }}>
                  Open
                </MenuItem>
                <MenuItem onClick={() => { handleOpen(list._id, list.title); handleMenuClose(); }}>
                  Rename
                </MenuItem>
                <MenuItem onClick={() => { deleteListFunc(list._id); handleMenuClose(); }}>
                  Delete
                </MenuItem>
              </Menu>
            </React.Fragment>
          );
        })}
      </SortableContext>
      
      {/* Drag overlay shows a preview of the dragged item */}
      <DragOverlay>
        {activeId ? (
          <Card sx={{ margin: '12px 0', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DragIndicatorIcon sx={{ marginRight: '8px' }} />
                <Typography>
                  {items.find(item => item._id === activeId)?.title || 'List'}
                </Typography>
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
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
  updateListOrder: PropTypes.func.isRequired, // Prop for updating list order
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
