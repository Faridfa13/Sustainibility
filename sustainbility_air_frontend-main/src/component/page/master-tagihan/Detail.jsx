import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import { formatDate, separator } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

const inisialisasiData = [
  {
    Key: null,
    "Harga": null,
    "Tanggal Berlaku": null,
    Count: 0,
  },
];

export default function MasterTagihanDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);

  const formDataRef = useRef({
    harga: "",
    tanggalBerlaku: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterTagihan/DetailTagihan",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data tagihan."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  

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
          Detail Data Tagihan
        </div>
        <div className="card-body p-4">
          <div className="row">
            
            <div className="col-lg-4">
              <Label
                forLabel="harga"
                title="Harga Saat Ini (Rp.)"
                data={separator(formDataRef.current.harga)}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="tanggalBerlaku"
                title="Tanggal Mulai Berlaku"
                data={formatDate(formDataRef.current.tanggalBerlaku)}
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
