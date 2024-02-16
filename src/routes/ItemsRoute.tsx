import { MouseEvent, useEffect, useState } from "react";
import ItemsDat from "../utils/items";
import Sidebar from "../components/Sidebar";
import { ItemDefinition, ItemsDatMeta } from "../types";
import ReactPaginate from "react-paginate";
import { byteConverter } from "../utils/Utils";

type CurrentPage = {
  endOffset: number;
  current: ItemDefinition[];
  pageCount: number;
};

type Filter = {
  noSeed?: boolean;
};

export default function ItemsRoute() {
  const itemsPerPage = 20;
  const itemOffset = 0;

  const [file, setFile] = useState<ArrayBuffer | null>(null);
  const [fileJson, setFileJson] = useState<ItemsDatMeta | null>(null);
  const [currentPage, setCurrent] = useState<CurrentPage | null>(null);
  const [activePage, setActivePage] = useState<number>(0);
  const [modalInfo, setModalInfo] = useState<ItemDefinition | null>(null);
  const [tempModalInfo, setTempModalInfo] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>({
    noSeed: true
  });

  const btn = document.getElementById("decode") as HTMLButtonElement;
  const decodeDownload = document.getElementById("downloadDecode") as HTMLButtonElement;
  const inputSearch = document.getElementById("table-search") as HTMLInputElement;
  const modalEl = document.getElementById("showModal") as HTMLFormElement;

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const handlePageClick = (event: { selected: number }) => {
    handleFilter(event.selected);
    setActivePage(event.selected);
  };

  const handleInputFilter = (ev: MouseEvent<HTMLInputElement>) => {
    switch (ev?.currentTarget.id) {
      case "noSeed": {
        setFilter({ noSeed: ev.currentTarget.checked });
        break;
      }
    }
  };

  const handleFilter = (page: number) => {
    let filterItems: ItemDefinition[];

    // eslint-disable-next-line, @typescript-eslint/no-non-null-asserted-optional-chain
    let searched = inputSearch.value
      ? fileJson?.items.filter((v) =>
          v.name?.toLowerCase().includes(inputSearch.value.toLowerCase())
        )
      : fileJson!.items;

    const newOffset = (page * itemsPerPage) % searched!.length;
    console.log(`User requested page number ${page}, which is offset ${newOffset}`);

    const endOffset = newOffset + itemsPerPage;

    if (filter.noSeed) searched = searched?.filter((it) => it.id! % 2 === 0);

    const currentItems = searched!.slice(newOffset, endOffset);

    const pageCount = Math.ceil(searched!.length / itemsPerPage);
    console.log({ newOffset, endOffset });
    setCurrent({ endOffset, current: currentItems!, pageCount });
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
      else image.src = `/game-image/game/${item?.texture?.replace(".rttex", ".png")}`;

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

  useEffect(() => {
    handleImage();

    return () => {
      // a
    };
  }, [currentPage]);

  useEffect(() => {
    console.log("imported", file);
    if (file !== null) {
      const itemDat = new ItemsDat(file);
      if (!itemDat.isFileValid()) alert("Please insert a valid items.dat file.");
      itemDat.decode().then((d) => {
        setFileJson(d);
      });
    }
    return () => {
      // a
    };
  }, [file]);

  useEffect(() => {
    console.log("changed", fileJson);
    if (fileJson !== null) {
      handleFilter(0);
    }
    return () => {
      // a
    };
  }, [fileJson]);

  useEffect(() => {
    if (fileJson !== null) {
      handleFilter(0);
    }
    return () => {
      // a
    };
  }, [filter]);

  const itemTool = () => {
    const input = document.getElementById("itemDat") as HTMLInputElement;

    const fileInput = input.files![0];

    const reader = new FileReader();
    reader.addEventListener("load", async (f) => {
      // file = f.target?.result as ArrayBuffer;
      setFile(f.target?.result as ArrayBuffer);

      // btn.disabled = false;
    });
    reader.readAsArrayBuffer(fileInput);
  };

  const decodeBtn = async () => {
    if (file) {
      btn.innerText = "Please wait...";
      const itemDat = new ItemsDat(file);

      const decoded = await itemDat.decode();
      // fileJsonString = JSON.stringify(decoded, null, 2);

      decodeDownload.disabled = false;
      btn.innerText = "Done!";

      // const data = URL.createObjectURL(new Blob([fileJsonString], { type: "text/json" }));

      // decodeDownload.setAttribute("href", data);
      // decodeDownload.setAttribute("download", "data.json");

      setTimeout(() => {
        btn.innerText = "Decode";
      }, 1500);
    } else {
      btn.innerText = "Please insert items.dat file";
      setTimeout(() => {
        btn.innerText = "Decode";
      }, 1500);
    }
  };

  return (
    <>
      <Sidebar>
        <dialog id="showModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{modalInfo?.name}</h3>
            {/* <p className="py-4">Press ESC key or click the button below to close</p> */}
            <div className="p-2">
              <textarea
                id="codeJson"
                className="textarea textarea-bordered textarea-lg w-full max-w-xl h-64 bg-base-300 text-base"
                value={tempModalInfo || ""}
                onChange={(e) => {
                  // console.log(e.target.value, isValidJson(e.target.value));
                  // if (isValidJson(e.target.value)) setModalInfo(JSON.parse(e.target.value));
                  // setModalInfo(JSON.parse(e.target.value));

                  setTempModalInfo(e.target.value);
                }}
              ></textarea>

              {/* <Editor
                value={JSON.stringify(modalInfo || "", null, 2)}
                onValueChange={(code) => {
                  if (isValidJson(code)) setModalInfo(JSON.parse(code));
                }}
                highlight={(code) => code}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace'
                }}
              /> */}
            </div>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <div
                  className="btn btn-primary"
                  onClick={() => {
                    const sendAlert = (message: string, type = "info", delayMS = 2000) => {
                      if (document.getElementById("toast-alert")) return;

                      const root = document.getElementById("showModal");
                      const toast = document.createElement("div");
                      const alert = document.createElement("div");

                      toast.id = "toast-alert";
                      toast.classList.add("toast", "toast-center");
                      alert.classList.add("alert", `alert-${type}`);
                      alert.textContent = message;

                      toast?.appendChild(alert);
                      root?.appendChild(toast);
                      setTimeout(() => {
                        root?.removeChild(toast);
                      }, delayMS);
                    };
                    if (isValidJson(tempModalInfo || "")) {
                      const index = fileJson?.items.findIndex((v) => v.id === modalInfo?.id);

                      if (index) {
                        fileJson!.items[index] = JSON.parse(tempModalInfo || "");
                        setFileJson({ ...fileJson!, items: fileJson!.items });
                        sendAlert("Sucessfully saved", "success");
                      } else sendAlert("Failed to save", "error");
                    } else {
                      sendAlert("Please validate the JSON syntax", "error");
                    }
                  }}
                >
                  Save
                </div>
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
            </div>
          </div>
        </dialog>
        <h1 className="text-lg">items.dat tools</h1>
        {/* <input required type="file" id="itemDat" onChange={itemTool} accept=".dat" /> */}

        <div>
          <input
            id="itemDat"
            type="file"
            accept=".dat"
            onChange={itemTool}
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div>

        <input
          id="table-search"
          type="text"
          placeholder="Search for items"
          className="input input-bordered w-full max-w-xs my-2"
          onKeyUp={(ev) => {
            handlePageClick({ selected: 0 });
          }}
        />
        <div className="dropdown lg:dropdown-right sm:dropdown-bottom lg:ml-2">
          <div tabIndex={0} role="button" className="btn btn-primary m-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
            </svg>{" "}
            Filter
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52"
          >
            <li>
              <label className="label cursor-pointer">
                <span className="label-text">No Seed</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  id="noSeed"
                  defaultChecked={filter.noSeed}
                  onClick={handleInputFilter}
                />
              </label>
            </li>
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
          {currentPage?.current.map((d) => {
            return (
              <div
                className="btn block bg-base-200 p-2 shadow-md w-40 h-40"
                key={d.id}
                data-itemid={d.id}
                onClick={(ev) => {
                  const btn = ev.target as HTMLButtonElement;
                  const id = btn.getAttribute("data-itemid") as string;
                  const item = fileJson?.items.find((v) => v.id === parseInt(id)) as ItemDefinition;

                  setModalInfo(item);
                  setTempModalInfo(JSON.stringify(item, null, 2));
                  modalEl.showModal();
                }}
              >
                <h1 className="text-center pb-6">{d.name}</h1>
                <canvas
                  className="block m-auto"
                  id="item_canvas"
                  width={64}
                  height={64}
                  data-itemid={d.id}
                ></canvas>
              </div>
            );
          })}
        </div>

        {fileJson?.items.length ? (
          <>
            <div className="join join-vertical lg:join-horizontal">
              <button
                className="btn btn-primary join-item"
                onClick={async () => {
                  const encoded = await new ItemsDat().encode(fileJson!);
                  // const meta = await new ItemsDat(encoded).decode();
                  // console.log({ meta });

                  const data = URL.createObjectURL(
                    new Blob([new Uint8Array(encoded)], { type: "application/octet-stream" })
                  );
                  const btn = document.getElementById("downloadItemsdat") as HTMLButtonElement;

                  btn.disabled = false;
                  btn.innerText = `Download ${byteConverter(
                    encoded.byteLength,
                    2,
                    ""
                  )} (EXPERTIMENT)`;
                  btn.setAttribute("href", data);
                  btn.setAttribute("download", "items.dat");
                }}
              >
                Encode
              </button>
              <button id="downloadItemsdat" className="btn btn-success join-item" disabled={true}>
                Download (EXPERTIMENT)
              </button>
            </div>
          </>
        ) : null}
        <div className="flex flex-wrap items-center justify-center mt-4">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={1}
            pageCount={currentPage?.pageCount || 0}
            previousLabel="<"
            // renderOnZeroPageCount={null}
            forcePage={activePage}
            containerClassName="join"
            breakLinkClassName="join-item btn"
            nextLinkClassName="join-item btn"
            previousLinkClassName="join-item btn"
            pageLinkClassName="join-item btn"
            activeLinkClassName="join-item btn btn-active"
          />
        </div>
      </Sidebar>
    </>
  );
}
