import React from "react";
import { HashRouter , Routes, Route } from "react-router-dom";
import GlobalContextProvider from "./GlobalContext";
import Settings from "./camera/Settings";
import CameraWrapper from "./camera/CameraWrapper";

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