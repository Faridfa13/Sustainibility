import { useState } from "react";
import MasterKomponenIndex from "./Index";
import MasterKomponenAdd from "./Add";
import MasterKomponenDetail from "./Detail";
import MasterKomponenEdit from "./Edit";

export default function MasterKomponen() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKomponenIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterKomponenAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterKomponenDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterKomponenEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      default:
        return <MasterKomponenIndex onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
