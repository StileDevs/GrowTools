// import { Helmet } from "react-helmet";
import { Routes, Route } from "react-router-dom";
import Main from "./routes/Main";
import ItemsRoute from "./routes/ItemsRoute";
import RttexToPngRoute from "./routes/RttexToPngRoute";
import Sidebar from "./components/Sidebar";
import PngToRttexRoute from "./routes/PngToRttexRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/itemsdat" element={<ItemsRoute />} />
        <Route path="/rttex-to-png" element={<RttexToPngRoute />} />
        <Route path="/png-to-rttex" element={<PngToRttexRoute />} />
        <Route
          path="*"
          element={
            <>
              <Sidebar>
                <div className="grid h-screen place-items-center">
                  <div>
                    <div className="text-center text-white font-bold text-4xl">Page not found</div>
                    <img className="h-auto max-w-full" src="/404.gif" alt="404" />
                  </div>
                </div>
              </Sidebar>
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
