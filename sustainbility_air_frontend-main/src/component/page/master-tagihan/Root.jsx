import { useState } from "react";
import MasterTagihanIndex from "./Index";
import MasterTagihanAdd from "./Add";
import MasterTagihanDetail from "./Detail";

export default function MasterTagihan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterTagihanIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterTagihanAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterTagihanDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
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
