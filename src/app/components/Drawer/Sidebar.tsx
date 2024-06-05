"use client";

import {
  Button,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box
} from "@mui/material";
import {
  AddPhotoAlternate,
  EdgesensorHigh,
  FilterDrama,
  GitHub,
  ImageSearch
} from "@mui/icons-material";
import Image from "next/image";
import { useAtom } from "jotai";
import { atomToggle } from "@/app/components";

export function Sidebar() {
  return (
    <>
      <Drawer variant="permanent" open={true}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button href="/" sx={{ my: 1 }}>
            <Typography variant="h6">GrowTools</Typography>
          </Button>
        </Box>
        <List>
          <ListItem>
            <ListItemButton href="/items-dat">
              <ListItemIcon>
                <FilterDrama />
              </ListItemIcon>
              <ListItemText>ItemsDat</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton href="/rttex-to-png">
              <ListItemIcon>
                <ImageSearch />
              </ListItemIcon>
              <ListItemText>RTTEX TO PNG</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton href="/png-to-rttex">
              <ListItemIcon>
                <AddPhotoAlternate />
              </ListItemIcon>
              <ListItemText>PNG TO RTTEX</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              href="https://github.com/JadlionHD/GrowTools"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <ListItemText>Source Code</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
