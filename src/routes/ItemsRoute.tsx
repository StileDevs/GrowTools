import { FC, useEffect, useState } from "react";
import ItemsDat from "../utils/items";
import Sidebar from "../components/Sidebar";
import { ItemDefinition, ItemsDatMeta } from "../types";
import ReactPaginate from "react-paginate";

type ItemsType = {
  data: ItemDefinition[];
};

type CurrentPage = {
  endOffset: number;
  current: ItemDefinition[];
  pageCount: number;
};

const Items: FC<ItemsType> = ({ data }) => {
  return (
    <>
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
            {data?.map((d) => {
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
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default function ItemsRoute() {
  const itemsPerPage = 20;

  const [file, setFile] = useState<ArrayBuffer | null>(null);
  const [fileJson, setFileJson] = useState<ItemsDatMeta | null>(null);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [currentPage, setCurrent] = useState<CurrentPage | null>(null);
  const [activePage, setActivePage] = useState<number>(0);

  const btn = document.getElementById("decode") as HTMLButtonElement;
  const decodeDownload = document.getElementById("downloadDecode") as HTMLButtonElement;
  const inputSearch = document.getElementById("table-search") as HTMLInputElement;

  const handlePageClick = (event: { selected: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
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
    console.log("changed", file);
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
            <Items data={currentPage?.current || []} />
          </div>
        </div>
      </Sidebar>
    </>
  );
}
