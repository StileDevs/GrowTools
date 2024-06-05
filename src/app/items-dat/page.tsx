"use client";

import { CloudUpload } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Pagination,
  TextField,
  Typography
} from "@mui/material";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { HiddenInput } from "./HiddenInput";
import axios from "axios";
import { ProgressWithLabel } from "./ProgressWithLabel";
import { ItemDefinition, ItemsDatMeta } from "../types";
import { ChangeEvent } from "react";

type CurrentPage = {
  endOffset: number;
  current: ItemDefinition[];
  pageCount: number;
};

const atomFile = atom(new ArrayBuffer(0));
const atomUploadFileProgress = atom(0);
const atomFileJson = atom<ItemsDatMeta | undefined>(undefined);
const atomFilter = atom({
  noSeed: true
});
const atomCurrentPage = atom<CurrentPage | undefined>(undefined);
const atomActivePage = atom(1);

export default function ItemsDat() {
  const itemsPerPage = 18;

  const [file, setFile] = useAtom(atomFile);
  const [uploadProgress, setUploadProgress] = useAtom(atomUploadFileProgress);
  const [fileJson, setFileJson] = useAtom<ItemsDatMeta | undefined>(atomFileJson);
  const [filter, setFilter] = useAtom(atomFilter);
  const [currentPage, setCurrent] = useAtom<CurrentPage | undefined>(atomCurrentPage);
  const [activePage, setActivePage] = useAtom(atomActivePage);

  const itemTool = () => {
    const input = document.getElementById("ItemsDatFile") as HTMLInputElement;
    const fileInput = input.files![0];

    if (!fileInput) return;
    const reader = new FileReader();
    reader.addEventListener("load", async (f) => {
      setFile(f.target?.result as ArrayBuffer);
    });
    reader.readAsArrayBuffer(fileInput);
  };

  const handlePageClick = (page: number) => {
    const inputSearch = document.getElementById("table-search") as HTMLInputElement;
    let searched = inputSearch.value
      ? fileJson?.items.filter((v) =>
          v.name?.value.toLowerCase().includes(inputSearch.value.toLowerCase())
        )
      : fileJson?.items;

    const newOffset = ((page - 1) * itemsPerPage) % searched!.length;
    const endOffset = newOffset + itemsPerPage;

    if (filter.noSeed) searched = searched?.filter((it) => it.id! % 2 === 0);

    const currentItems = searched!.slice(newOffset, endOffset);
    const pageCount = Math.ceil(searched!.length / itemsPerPage);

    setCurrent({ endOffset, current: currentItems!, pageCount });
    setActivePage(page);
  };

  const handleImage = () => {
    const canva: NodeListOf<HTMLCanvasElement> | undefined =
      document.querySelectorAll("#item_canvas");

    canva?.forEach((e) => {
      const ctx = e.getContext("2d");
      const item = currentPage?.current.find(
        (v) => v.id === parseInt(e.getAttribute("data-itemid")!)
      );
      const image = new Image();

      const isSeed = (item?.id as number) % 2 === 1;
      if (isSeed) image.src = `/game-image/game/seed.png`;
      else image.src = `/game-image/game/${item?.texture?.value.replace(".rttex", ".png")}`;

      image.addEventListener("load", () => {
        if (isSeed) {
          ctx?.drawImage(image, (item?.seedBase as number) * 16, 0, 16, 16, 0, 0, 64, 64);
          ctx?.drawImage(image, (item?.seedOverlay as number) * 16, 16, 16, 16, 0, 0, 64, 64);
        } else {
          const textureX = (item?.textureX as number) * 32;
          const textureY = (item?.textureY as number) * 32;

          const cropPos = isSeed ? 16 : 32;
          // console.log({ itemName: item?.name, isSeed, textureX, textureY, cropPos });
          ctx?.drawImage(image, textureX, textureY, 32, 32, 0, 0, 64, 64);
        }
      });
    });
    console.log("aaa");
  };

  const handleInputFilter = (ev: ChangeEvent<HTMLInputElement>) => {
    switch (ev?.currentTarget.id) {
      case "noSeed": {
        setFilter({ noSeed: ev.currentTarget.checked });
        break;
      }
    }
  };

  useEffect(() => {
    if (file.byteLength) {
      axios
        .post("/api/items/decode", file, {
          onUploadProgress(progressEvent) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / (progressEvent.total as number))
            );
          }
        })
        .then((res) => {
          if (res.status !== 200) return () => {};
          setFileJson(res.data);
        });

      return () => {};
    }
    return () => {};
  }, [file]);

  useEffect(() => {
    console.log({ uploadProgress });
    return () => {};
  }, [uploadProgress]);

  useEffect(() => {
    console.log({ fileJson });
    if (fileJson) handlePageClick(1);
    return () => {};
  }, [fileJson]);

  useEffect(() => {
    if (fileJson) handlePageClick(1);
    return () => {};
  }, [filter]);

  useEffect(() => {
    handleImage();
    return () => {};
  }, [currentPage]);

  return (
    <>
      <Typography variant="h5" sx={{ my: 2 }}>
        ItemsDat Tools
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUpload />}
        >
          Upload file
          <HiddenInput type="file" id="ItemsDatFile" accept=".dat" onChange={itemTool} />
        </Button>
        {fileJson ? undefined : uploadProgress < 100 ? (
          <>
            {uploadProgress !== 0 && (
              <>
                Uploading
                <ProgressWithLabel value={uploadProgress} size={32} />
              </>
            )}
          </>
        ) : (
          <>
            Processing data <CircularProgress size={32} />
          </>
        )}
      </Box>

      {fileJson && (
        <>
          <TextField
            id="table-search"
            label="Search item"
            variant="standard"
            onKeyUp={(ev) => handlePageClick(1)}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox checked={filter.noSeed} onChange={handleInputFilter} id="noSeed" />
              }
              label="No Seed"
            />
          </FormGroup>

          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {currentPage?.current.map((d) => {
              return (
                <Box
                  key={d.id}
                  height={140}
                  width={140}
                  p={2}
                  sx={{
                    border: "2px solid grey"
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>{d.name?.value}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <canvas id="item_canvas" width={64} height={64} data-itemid={d.id}></canvas>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Pagination
            count={currentPage?.pageCount || 0}
            onChange={(e, page) => handlePageClick(page)}
            page={activePage}
            sx={{ display: "flex", justifyContent: "center", my: 4 }}
          ></Pagination>
        </>
      )}
    </>
  );
}
