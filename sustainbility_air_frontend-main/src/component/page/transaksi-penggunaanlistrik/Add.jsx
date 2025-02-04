import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function DataPenggunaanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKomponen, setListKomponen] = useState([]);
  const [showButtons, setShowButtons] = useState(false); // Tampilkan tombol ON/OFF jika data berhasil disimpan
  const [statusMessage, setStatusMessage] = useState(""); // Indikator status terakhir

  const formDataRef = useRef({
    komponen: "",
    nama: "",
    nim: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const komponenData = await UseFetch(
          API_LINK + "MasterKomponen/GetListKomponen",
          {}
        );
        if (komponenData === "ERROR") {
          throw new Error("Gagal mengambil data komponen.");
        } else {
          setListKomponen(komponenData);
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
        setListKomponen([]);
      }
    };

    fetchData();
  }, []);

  const userSchema = object({
    komponen: string().required("Komponen harus dipilih"),
    nama: string().required("Nama harus diisi"),
    nim: string()
      .required("NIM harus diisi")
      .matches(/^\d+$/, "NIM hanya boleh berisi angka"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "nim" && !/^\d*$/.test(value)) {
      // Jika input bukan angka, hentikan perubahan
      setErrors((prevErrors) => ({
        ...prevErrors,
        nim: "NIM hanya boleh berupa angka",
      }));
      return;
    }

    // Jika valid, lanjutkan perubahan
    const validationError = await validateInput(name, value, userSchema);

    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleSaveData = async (e) => {
    e.preventDefault();

    // Mendapatkan waktu lokal dengan format sesuai SQL Server
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    if (listKomponen.length === 0) {
      setIsError({
        error: true,
        message: "Data komponen tidak tersedia. Silakan muat ulang halaman.",
      });
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const payload = {
          komponen: formDataRef.current.komponen,
          Nama: formDataRef.current.nama,
          Nim: formDataRef.current.nim,
          Waktu_mulai: timestamp,
          Waktu_selesai: null,
        };

        const data = await UseFetch(
          API_LINK + "TrsForm/DataPenggunaan",
          payload,
          "POST"
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data penggunaan.");
        } else {
          SweetAlert(
            "Sukses",
            "Data penggunaan berhasil disimpan",
            "success"
          );
          setShowButtons(true);
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleStatus = async (status) => {
    const timestamp = new Date().toISOString();

    setIsLoading(true);
    try {
      const data = await UseFetch(
        API_LINK + "TrsForm/UpdateStatus",
        {
          kom_id: formDataRef.current.komponen,
          Waktu: timestamp,
          kondisi: status,
        },
        "POST"
      );

      if (data === "ERROR") {
        throw new Error(`Gagal mengirim status ${status}`);
      } else {
        const cek = "A01=" + status + ";";
        const cus = await UseFetch(
          API_LINK + "Mqtt/send",
          {
            topic: "ENERGYMONITORING2024",
            message: cek,
          },
          "POST"
        );

        if (data === "ERROR") {
          throw new Error(`Salah mengirim status ${status}`);
        } else {
          SweetAlert(
            "Sukses",
            `Status ${status} berhasil dikirim ke database.`,
            "success"
          );
          setStatusMessage(
            `Status terakhir: ${status} (${new Date().toLocaleString()})`
          );
        }
      }
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  if (isError.error) {
    return (
      <div className="text-center mt-4">
        <Alert type="danger" message={isError.message} />
        <Button
          classType="primary px-4 py-2"
          label="Coba Lagi"
          onClick={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <>
      {!showButtons ? (
        <form onSubmit={handleSaveData}>
          <div className="card">
            <div className="card-header bg-primary fw-medium text-white">
              Tambah Data Penggunaan
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-6">
                  <DropDown
                    forInput="komponen"
                    label="Komponen"
                    arrData={
                      listKomponen.length > 0
                        ? listKomponen
                        : [{ value: "", label: "Memuat data..." }]
                    }
                    isRequired
                    value={formDataRef.current.komponen}
                    onChange={handleInputChange}
                    errorMessage={errors.komponen}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    type="text"
                    forInput="nama"
                    label="Nama"
                    isRequired
                    value={formDataRef.current.nama}
                    onChange={handleInputChange}
                    errorMessage={errors.nama}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    type="text"
                    forInput="nim"
                    label="NIM"
                    isRequired
                    value={formDataRef.current.nim}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    errorMessage={errors.nim}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="float-end my-4 mx-1">
            <Button
              classType="secondary me-2 px-4 py-2"
              label="BATAL"
              onClick={() => onChangePage("index")}
            />
            <Button
              classType="primary ms-2 px-4 py-2"
              type="submit"
              label="SIMPAN"
            />
          </div>
        </form>
      ) : (
        <div className="text-center mt-4">
          <Button
            classType="success px-4 py-2"
            label="ON"
            onClick={() => handleToggleStatus("ON")}
          />
          <Button
            classType="danger ms-3 px-4 py-2"
            label="OFF"
            onClick={() => handleToggleStatus("OFF")}
          />
          {statusMessage && (
            <div className="alert alert-info mt-3">{statusMessage}</div>
          )}
        </div>
      )}
    </>
  );
}
