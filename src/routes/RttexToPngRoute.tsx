import { MouseEvent, useEffect, useState } from "react";
import { RTTEX } from "../utils/rtpack";
import Sidebar from "../components/Sidebar";

interface FileType {
  name?: string;
  size?: number;
  arrayBuffer?: ArrayBuffer;
  file?: DataView;
  fileUrl?: string;
}

interface FileCounter {
  max: number;
  current: number;
}

export default function RttexToPngRoute() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [modalInfo, setModalInfo] = useState<FileType | null>(null);
  const modalEl = document.getElementById("showModal") as HTMLFormElement;

  const rttexHandle = () => {
    const input = document.getElementById("rttexFileUpload") as HTMLInputElement;

    const fileInput = input.files!;

    for (let i = 0; i < fileInput.length; ++i) {
      const temp: FileType = {
        name: "",
        arrayBuffer: new ArrayBuffer(0),
        size: 0
      };

      const reader = new FileReader();
      reader.addEventListener("load", async (f) => {
        temp.arrayBuffer = f.target?.result as ArrayBuffer;
        const file = await RTTEX.decode(new DataView(f.target?.result as ArrayBuffer));
        temp.file = file;
        temp.fileUrl = URL.createObjectURL(new Blob([file.buffer!], { type: "image/png" }));

        setFiles((e) => [...e, temp]);
        reader.abort();
      });

      temp.name = fileInput.item(i)?.name;
      temp.size = fileInput.item(i)?.size;

      reader.readAsArrayBuffer(fileInput.item(i)!);
    }
  };

  useEffect(() => {
    console.log({ files });

    return () => {
      // e
    };
  }, [files]);

  return (
    <>
      <Sidebar>
        <dialog id="showModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">{modalInfo?.name}</h3>
            {/* <p className="py-4">Press ESC key or click the button below to close</p> */}
            <div className="p-2 bg-base-300">
              <img src={modalInfo?.fileUrl} alt={modalInfo?.name} />
            </div>

            <div className="modal-action">
              <a
                className="btn btn-primary mr-2"
                href={modalInfo?.fileUrl}
                download={modalInfo?.name?.replace(".rttex", ".png")}
              >
                Download
              </a>
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn" onClick={() => setModalInfo(null)}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>

        <h1 className="mb-4">RTTEX TO PNG</h1>

        <div>
          <input
            id="rttexFileUpload"
            type="file"
            accept=".rttex"
            onChange={() => {
              rttexHandle();
            }}
            className="file-input file-input-bordered w-full max-w-xs"
            multiple
          />
        </div>

        {files.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((v, i) => {
                    return (
                      <tr key={i + 1}>
                        <th>{i + 1}</th>
                        <td>{v.name}</td>
                        <td>{v.size}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setModalInfo(v);
                              modalEl.showModal();
                            }}
                            data-name={`${v.name}`}
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : undefined}
      </Sidebar>
    </>
  );
}
