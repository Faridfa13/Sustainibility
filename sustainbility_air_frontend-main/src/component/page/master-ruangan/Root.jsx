import { useState } from "react";
import MasterRuanganIndex from "./Index";
import MasterRuanganAdd from "./Add";
import MasterRuanganDetail from "./Detail";
import MasterRuanganEdit from "./Edit";

export default function MasterRuangan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterRuanganIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterRuanganAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterRuanganDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterRuanganEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      default:
        return <MasterRuanganIndex onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode, withID = null) {
    setPageMode(mode);
    if (withID) {
      setDataID(withID);
    }
  }

  return <div>{getPageMode()}</div>;
}
