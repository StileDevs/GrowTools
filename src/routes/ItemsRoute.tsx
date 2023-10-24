/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from "react";
import ItemsDat from "../utils/items";
import Sidebar from "../components/Sidebar";
import { ItemDefinition, ItemsDatMeta } from "../types";
import ReactPaginate from "react-paginate";
import { Modal } from "flowbite";
import type { ModalOptions, ModalInterface } from "flowbite";

type CurrentPage = {
  endOffset: number;
  current: ItemDefinition[];
  pageCount: number;
};

export default function ItemsRoute() {
  const itemsPerPage = 20;
  const itemOffset = 0;

  const [file, setFile] = useState<ArrayBuffer | null>(null);
  const [fileJson, setFileJson] = useState<ItemsDatMeta | null>(null);
  const [currentPage, setCurrent] = useState<CurrentPage | null>(null);
  const [activePage, setActivePage] = useState<number>(0);
  const [modalInfo, setModalInfo] = useState<ItemDefinition | null>(null);

  const btn = document.getElementById("decode") as HTMLButtonElement;
  const decodeDownload = document.getElementById("downloadDecode") as HTMLButtonElement;
  const inputSearch = document.getElementById("table-search") as HTMLInputElement;

  const modalEl: HTMLElement | null = document.getElementById("showModal");

  const modalOptions: ModalOptions = {
    placement: "center",
    backdrop: "static",
    closable: true,
    onHide: () => {
      console.log("modal is hidden");
    },
    onShow: () => {
      console.log("modal is shown");
    },
    onToggle: () => {
      console.log("modal has been toggled");
    }
  };

  const modal: ModalInterface = new Modal(modalEl, modalOptions);

  const handlePageClick = (event: { selected: number }) => {
    // eslint-disable-next-line, @typescript-eslint/no-non-null-asserted-optional-chain
    const searched = inputSearch.value
      ? fileJson?.items.filter((v) =>
          v.name?.toLowerCase().includes(inputSearch.value.toLowerCase())
        )
      : fileJson!.items;

    const newOffset = (event.selected * itemsPerPage) % searched!.length;
    console.log(`User requested page number ${event.selected}, which is offset ${newOffset}`);

    const endOffset = newOffset + itemsPerPage;
    const currentItems = searched!.slice(newOffset, endOffset);
    const pageCount = Math.ceil(searched!.length / itemsPerPage);
    console.log({ newOffset, endOffset });
    setCurrent({ endOffset, current: currentItems!, pageCount });
    setActivePage(event.selected);
  };

  useEffect(() => {
    console.log("imported", file);
    if (file !== null) {
      const itemDat = new ItemsDat(file);
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
      const endOffset = itemOffset + itemsPerPage;
      const currentItems = fileJson?.items.slice(itemOffset, endOffset);
      const pageCount = Math.ceil(fileJson.items.length / itemsPerPage);
      setCurrent({ endOffset, current: currentItems, pageCount });
    }
    return () => {
      // a
    };
  }, [fileJson]);

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
      <div
        id="showModal"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full max-w-2xl max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            {/* <!-- Modal header --> */}
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {modalInfo?.name}
              </h3>
              <button
                type="button"
                onClick={(ev) => {
                  modal.hide();
                  document.querySelector("body > div[modal-backdrop]")?.remove();
                }}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* <!-- Modal body --> */}
            <div className="p-6 space-y-6">
              {Object.entries(modalInfo || {}).map(([key, value], i) => {
                return (
                  <div key={`modalInfo_${i}`}>
                    <label
                      htmlFor={`modal_${key}`}
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >{`${key}`}</label>
                    <input
                      type="text"
                      id={`modal_${key}`}
                      onChange={(ev) => {
                        // e
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={typeof value === "object" ? `${JSON.stringify(value)}` : `${value}`}
                    />
                  </div>
                );
              })}
            </div>
            {/* <!-- Modal footer --> */}
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                type="button"
                onClick={(ev) => {
                  modal.hide();
                  document.querySelector("body > div[modal-backdrop]")?.remove();
                }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={(ev) => {
                  modal.hide();
                  document.querySelector("body > div[modal-backdrop]")?.remove();
                }}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sidebar>
        <h1 className="text-lg dark:text-white">items.dat tools</h1>
        {/* <input required type="file" id="itemDat" onChange={itemTool} accept=".dat" /> */}

        <div>
          <input
            className="block w-64 mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="itemDat"
            type="file"
            onChange={itemTool}
            accept=".dat"
          ></input>
        </div>
        <div className="mt-4">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={1}
            pageCount={currentPage?.pageCount || 0}
            previousLabel="<"
            // renderOnZeroPageCount={null}
            forcePage={activePage}
            containerClassName="flex"
            breakLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            nextLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            previousLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            pageLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            activeLinkClassName="!text-blue-600 !border-blue-300 !bg-blue-50 !hover:bg-blue-100 !hover:text-blue-700"
          />
          <div className="mt-2">
            <div className="flex items-center pb-4">
              <label htmlFor="table-search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="table-search"
                  className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search for items"
                  onKeyPress={(ev) => {
                    if (ev.key === "Enter") handlePageClick({ selected: 0 });
                  }}
                ></input>
              </div>
              <button
                type="button"
                onClick={() => handlePageClick({ selected: 0 })}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-2 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Search
              </button>
            </div>
            {/* <Items data={currentPage?.current || []} /> */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPage?.current.map((d) => {
                    return (
                      <tr
                        key={d.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {d.id}
                        </th>
                        <td className="px-6 py-4">{d.name}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            dataid={d.id}
                            onClick={(ev) => {
                              const btn = ev.target as HTMLButtonElement;
                              const id = btn.getAttribute("dataid") as string;
                              const item = fileJson?.items.find(
                                (v) => v.id === parseInt(id)
                              ) as ItemDefinition;

                              setModalInfo(item);
                              console.log(item);

                              modal.show();
                            }}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
