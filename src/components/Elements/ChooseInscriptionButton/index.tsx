"use client";
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { IoIosAddCircleOutline } from "react-icons/io";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

type NFTData = {
  id: number;
  name: string;
};

const ChooseInscriptionButton = () => {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<NFTData | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelectData = (data: NFTData) => {
    setSelectedData(data);
    handleClose();
    console.log('Selected Data:', data);
  };

  const data: NFTData[] = [
    { id: 1, name: 'NFT 1' },
    { id: 2, name: 'NFT 2' },
    { id: 3, name: 'NFT 3' },
  ]; // Replace with your actual data

  return (
    <div className="flex justify-center items-center h-full">
      <div
        className="border-2 border-customPurple_800 rounded-lg p-10 text-center text-customPurple_800 cursor-pointer hover:bg-transparent hover:text-white transition-colors"
        onClick={handleOpen}
      >
        <div className="text-5xl w-full flex justify-center"><IoIosAddCircleOutline/></div>
        <div className="text-lg">Choose Inscription for Auction</div>
      </div>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Select an Inscription for Auction
          </Typography>
          <List>
            {data.map((item) => (
              <ListItem  key={item.id} onClick={() => handleSelectData(item)}>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
          </List>
          <Button onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ChooseInscriptionButton;
