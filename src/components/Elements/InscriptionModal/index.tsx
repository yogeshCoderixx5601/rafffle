"use client";
import React from "react";
import {
  Button,
  Box,
  Typography,
  Modal,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { shortenString } from "@/utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const InscriptionModal = ({
  open,
  onClose,
  onSelect,
  inscriptions,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (inscriptions: any) => void;
  inscriptions: any[];
}) => {
console.log(inscriptions,"inscriptions")
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Select an Inscription for Auction
        </Typography>
        <List className="w-full flex">
          {inscriptions?.map((item, idx) => (
            <ListItem
              key={idx}
              onClick={() => {
                console.log("Selected item:", item); // Log the selected item
                onSelect(item);
              }}
            >
              <div className="w-full flex justify-start cursor-pointer hover:bg-customPurple_950 px-2 py-1 rounded">
                <ListItemText
                  className="text-white"
                  primary={
                    <div className="flex gap-2">
                      <div>{idx + 1}.</div>
                      <div className=""><img src={`http://192.168.1.17:8080/content/${item.inscription_id}`} alt={`${item.inscription_id}`} className="w-[30px] h-[30px]" /></div>
                      <div>{shortenString(item.inscription_id)}</div>
                    </div>
                  }
                />
              </div>
            </ListItem>
          ))}
        </List>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Modal>
  );
};

export default InscriptionModal;
