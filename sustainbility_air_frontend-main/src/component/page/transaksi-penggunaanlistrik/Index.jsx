import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const initialData = [
  {
    Id: null,
    Nama: null,
    Nim: null,
    "Waktu Mulai": null,
    "Waktu Selesai": null,
    "Sensor Code": null,
    "Voltage (V)": null,
    "Current (A)": null,
    "Power (Watt)": null,
    "Energy (kWh)": null,
    "Time (Minutes)": null,
    Count: 0,
  },
];

const filterSortOptions = [
  { Value: "Energy ASC", Text: "Energi (kWh) [↑]" },
  { Value: "Energy DESC", Text: "Energi (kWh) [↓]" },
  { Value: "[Sensor Code] ASC", Text: "Kode Sensor [↑]" },
  { Value: "[Sensor Code] DESC", Text: "Kode Sensor [↓]" },
];



const filterStatusOptions = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function SensorDataIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "Energy DESC",
    status: "Aktif",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({ ...prevFilter, page: newCurrentPage }));
  }

  function handleSearch() {
    setIsLoading(true);
    const [sortBy, sortDirection] = searchFilterSort.current.value.split(" ");
    
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1, // reset ke halaman pertama saat pencarian dilakukan
      query: searchQuery.current.value,
      sort: sortBy + " " + sortDirection, // pastikan kolom dan arah sorting diatur
      status: searchFilterStatus.current.value,
    }));
  }  
  
  
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "TrsForm/GetSensorData", {
          p1: currentFilter.page.toString(),
          p2: currentFilter.query,
          p3: currentFilter.sort,
          p4: currentFilter.status === "Aktif" ? "Aktif" : "Tidak Aktif",
        });
  
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: [
              "center", "center", "left", "center", "center", "center", "center", "center", "center", "center", "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [currentFilter]);
  

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data sensor."
          />
        </div>
      )}

      <div className="flex-fill">
        <div className="input-group">
          <Button
            // iconName="add"
            // classType="success"
            // label="Tambah"
            onClick={() => onChangePage("add")}
          />
          <Input
            ref={searchQuery}
            forInput="pencarianSensor"
            placeholder="Cari Nama"
          />
          <Button
            iconName="search"
            classType="primary px-4"
            title="Cari"
            onClick={handleSearch}
          />
          <Filter>
            <DropDown
              ref={searchFilterSort}
              forInput="ddUrut"
              label="Urut Berdasarkan"
              type="none"
              arrData={filterSortOptions}
              defaultValue="tr.Id asc"
            />
            <DropDown
              ref={searchFilterStatus}
              forInput="ddStatus"
              label="Status"
              type="none"
              arrData={filterStatusOptions}
              defaultValue="Aktif"
            />
          </Filter>
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <Table
              data={currentData}
              onToggle={(id) => console.log("Toggle status for ID:", id)}
              onDetail={onChangePage}
              onEdit={onChangePage}
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={currentData[0]["Count"]} // Total data harus diambil dengan benar dari API
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
