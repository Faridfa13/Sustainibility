import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKomponenDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    noKomponen: "",
    jenisKomponen: "",
    ampereKomponen: "",
    kondisiKomponen: "",
    statusKomponen: "",
    settingKomponen: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponen/DetailKomponen",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data komponen.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Komponen
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="noKomponen"
                title="Nomor Komponen"
                data={formDataRef.current.noKomponen}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="jenisKomponen"
                title="Jenis"
                data={formDataRef.current.jenisKomponen}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="ampereKomponen"
                title="Ampere"
                data={formDataRef.current.ampereKomponen}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="kondisiKomponen"
                title="Kondisi"
                data={formDataRef.current.kondisiKomponen}
              />
            </div>
            {/* <div className="col-lg-4">
              <Label
                forLabel="kom_watt"
                title="Watt"
                data={formDataRef.current.kom_watt}
              />
            </div> */}
            <div className="col-lg-4">
              <Label
                forLabel="statusKomponen"
                title="Status"
                data={formDataRef.current.statusKomponen}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
