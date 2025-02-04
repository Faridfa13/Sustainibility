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


const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No Komponen": null,
    Jenis: null,
    Ampere: null,
    Kondisi: null,
    Status: null,
    Setting: null,
    Count: 0,
    RowStyle: "",
  },
];

const dataFilterSort = [
  { Value: "[No Komponen] asc", Text: "No Komponen [↑]" },
  { Value: "[No Komponen] desc", Text: "No Komponen [↓]" },
  { Value: "[Jenis] asc", Text: "Jenis [↑]" },
  { Value: "[Jenis] desc", Text: "Jenis [↓]" },
  { Value: "[Kondisi] asc", Text: "Kondisi [↑]" },
  { Value: "[Kondisi] desc", Text: "Kondisi [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterKomponenIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[No Komponen] asc",
    status: "Aktif",
  });
  const formDataRef = useRef({
    noKomponen: "",
    jenisKomponen: "",
    ampereKomponen: "",
    kondisiKomponen: "",
    statusKomponen: "",
    settingKomponen: ""
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const handleSetCurrentPage = (newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
  };

  const handleSetStatus = async (id) => {
    setIsLoading(true);
    setIsError(false);
  
    try {
      // Fetch detail komponen berdasarkan ID
      const data = await UseFetch(
        API_LINK + "MasterKomponen/DetailKomponen",
        { id: id }
      );
  
      if (data === "ERROR" || data.length === 0) {
        throw new Error("Terjadi kesalahan: Gagal mengambil data komponen.");
      } else {
        // Update formDataRef dengan data terbaru
        formDataRef.current = { ...formDataRef.current, ...data[0] };
        console.log(formDataRef.current);
        // Cek apakah settingKomponen == 1 (ON)
        if (formDataRef.current.settingKomponen === 1) {
          // Tampilkan alert bahwa komponen masih ON
          SweetAlert(
            "Peringatan!",
            `Komponen ${formDataRef.current.noKomponen} masih ON. Matikan terlebih dahulu sebelum mengubah status.`,
            "warning"
          );
          return; // Hentikan eksekusi di sini
        }
  
        // Panggil API untuk mengubah status jika komponen tidak ON
        UseFetch(API_LINK + "MasterKomponen/SetStatusKomponen", {
          idKomponen: id
        })
          .then((data) => {
            if (data === "ERROR" || !data || data.length === 0) {
              setIsError(true);
            } else {
              // Ambil status terbaru dari response
              const updatedStatus = data[0].Status;
  
              // Tampilkan SweetAlert sukses
              SweetAlert(
                "Sukses",
                `Status data komponen berhasil diubah menjadi ${updatedStatus}`,
                "success"
              );
              handleSetCurrentPage(currentFilter.page); // Refresh tabel
            }
          })
          .catch((error) => {
            console.error("Terjadi kesalahan:", error);
            setIsError(true);
            SweetAlert(
              "Error",
              "Terjadi kesalahan saat mengubah status.",
              "error"
            );
          })
          .finally(() => setIsLoading(false));
      }
    } catch (error) {
      console.error(error.message);
      setIsError({ error: true, message: error.message });
      SweetAlert("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  
    
  
  const handleSetSetting = (id, komponen, onoff) => {
    
    const statusBaru = onoff === "ON" ? "OFF" : "ON";
  
    if (statusBaru === "ON") {
      // Langsung ubah ke ON tanpa konfirmasi
      setIsLoading(true);
      setIsError(false);
  
      UseFetch(API_LINK + "MasterKomponen/SetSettingKomponen", { idKomponen: id })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) {
            setIsError(true);
          } else {
            const cek = `${komponen}=${statusBaru};`;
  
            UseFetch(API_LINK + "Mqtt/send", { topic: "ENERGYMONITORING2024", message: cek }, "POST")
              .then(() => {
                console.log("Pesan MQTT berhasil dikirim.");
              })
              .catch((error) => {
                console.error("Error MQTT:", error);
              });
  
            SweetAlert("Sukses", `Setting data komponen berhasil diubah menjadi ${statusBaru}`, "success");
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .catch((error) => {
          setIsError(true);
          console.error("Terjadi error saat memproses API:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Tampilkan dialog konfirmasi untuk OFF
      SweetAlert(
        "Konfirmasi",
        `Apakah Anda yakin ingin mengubah status ${komponen} menjadi OFF?`,
        "warning",
        true
      ).then((willConfirm) => {
        if (willConfirm) {
          // Jika pengguna memilih "Ya"
          setIsLoading(true);
          setIsError(false);
  
          UseFetch(API_LINK + "MasterKomponen/SetSettingKomponen", { idKomponen: id })
            .then((data) => {
              if (data === "ERROR" || data.length === 0) {
                setIsError(true);
              } else {
                const cek = `${komponen}=${statusBaru};`;
  
                UseFetch(API_LINK + "Mqtt/send", { topic: "ENERGYMONITORING2024", message: cek }, "POST")
                  .then(() => {
                    console.log("Pesan MQTT berhasil dikirim.");
                  })
                  .catch((error) => {
                    console.error("Error MQTT:", error);
                  });
  
                SweetAlert(
                  "Sukses",
                  `Setting data komponen berhasil diubah menjadi ${statusBaru}`,
                  "success"
                );
  
                handleSetCurrentPage(currentFilter.page);
              }
            })
            .catch((error) => {
              setIsError(true);
              console.error("Terjadi error saat memproses API:", error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          console.log("Pengguna membatalkan perubahan status.");
        }
      });
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "MasterKomponen/GetDataKomponen", {
          page: currentFilter.page,
          query: currentFilter.query,
          sort: currentFilter.sort,
          status: currentFilter.status,
        });
    
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Status: value.Status || "Tidak Aktif", // Pastikan ada nilai default jika Status kosong
            Ampere: value.Ampere ? `${value.Ampere} A` : "",
            RowStyle: value.Setting === 1 ? "table-success" : "table-danger", // Tetap gunakan nilai asli Setting untuk pewarnaan
            Setting: value.Setting === 1 ? "ON" : "OFF", // Status setting
            Kabar: ["Onoff"],
            Aksi: ["Toggle", "Detail", "Edit"],
            Alignment: Array(9).fill("center"),
          }));          
          setCurrentData(formattedData);
        }
      } catch {
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
        <Alert
          type="warning"
          message="Terjadi kesalahan: Gagal mengambil data komponen."
        />
      )}
      <div className="input-group">
        <Button
          iconName="add"
          classType="success"
          label="Tambah"
          onClick={() => onChangePage("add")}
        />
        <Input
          ref={searchQuery}
          forInput="pencarianKomponen"
          placeholder="Cari No Komponen / Jenis Komponen"
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
            arrData={dataFilterSort}
            defaultValue="[No Komponen] asc"
          />
          <DropDown
            ref={searchFilterStatus}
            forInput="ddStatus"
            label="Status"
            type="none"
            arrData={dataFilterStatus}
            defaultValue={currentFilter.status || "Aktif"} // Pastikan status default ada
          />
        </Filter>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <Table
              data={currentData}
              onOnoff={handleSetSetting}
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={currentData[0]["Count"]}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
useEffect
