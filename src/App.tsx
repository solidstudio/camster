import React from "react";
import { HashRouter , Routes, Route } from "react-router-dom";
import GlobalContextProvider from "./GlobalContext";
import Settings from "./Settings";
import CameraWrapper from "./CameraWrapper";

const App = () =>  {
  return (
      <HashRouter>
        <GlobalContextProvider>
          <Routes>
            <Route path="/" element={ <Settings /> }></Route>
            <Route path="/camera" element={<CameraWrapper/>}/>
          </Routes>
        </GlobalContextProvider>
      </HashRouter>
  );
}

export default App;