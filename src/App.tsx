import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalContextProvider from "./GlobalContext";
import Settings from "./Settings";
import CameraWrapper from "./CameraWrapper";

const App = () =>  {
  return (
      <BrowserRouter>
        <GlobalContextProvider>
          <Routes>
            <Route path="/" element={ <Settings /> }></Route>
            <Route path="/camera" element={<CameraWrapper/>}/>
          </Routes>
        </GlobalContextProvider>
      </BrowserRouter>
  );
}

export default App;