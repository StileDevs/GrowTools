// import { Helmet } from "react-helmet";
import { Routes, Route } from "react-router-dom";
import Main from "./routes/Main";
import ItemsRoute from "./routes/ItemsRoute";
import "flowbite";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/itemsdat" element={<ItemsRoute />} />
      </Routes>
    </>
  );
}

export default App;
