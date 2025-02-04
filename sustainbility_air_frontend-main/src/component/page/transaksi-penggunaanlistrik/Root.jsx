import { useState } from "react";
import SensorDataIndex from "./Index";
import TransaksiPenempatanAdd from "./Add";
import TransaksiPenempatanDetail from "./Detail";

export default function TransaksiPenggunaanListrik() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <SensorDataIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiPenempatanAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <TransaksiPenempatanDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      default:
        return <TransaksiPenempatanIndex onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }
  return <div>{getPageMode()}</div>;
}
