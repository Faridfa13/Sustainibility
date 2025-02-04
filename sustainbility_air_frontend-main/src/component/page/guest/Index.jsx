import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import Swal from "sweetalert2";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Logo from "../../../assets/IMG_Logo_white.png";

export default function DataPenggunaanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKomponen, setListKomponen] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [usageTime, setUsageTime] = useState(0); // Waktu pemakaian dalam detik
  const [isDeviceOn, setIsDeviceOn] = useState(false); // Status perangkat ON/OFF
  const [notified, setNotified] = useState(false); // Untuk melacak apakah notifikasi sudah muncul

  useEffect(() => {
    let interval;

    if (isDeviceOn) {
      interval = setInterval(() => {
        setUsageTime((prevTime) => prevTime + 1); // Tambah 1 detik setiap interval
      }, 1000);
    } else {
      clearInterval(interval);
      setNotified(false); // Reset notifikasi jika perangkat mati
    }

    return () => clearInterval(interval); // Bersihkan interval saat komponen tidak digunakan
  }, [isDeviceOn]);

  // Periksa waktu pemakaian dan tampilkan notifikasi jika lebih dari 1 jam
  useEffect(() => {
    if (usageTime >= 60 && !notified) {
      SweetAlert("Peringatan", "Perangkat telah digunakan selama lebih dari 1 jam. Harap periksa kembali.", "warning");
    
      setNotified(true); // Tandai bahwa notifikasi sudah muncul
    }
  }, [usageTime, notified]);

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

  const sweetAlertForOff = (title, text, icon) => {
    if (SweetAlert && SweetAlert.fire) {
      SweetAlert.fire({
        title,
        text,
        icon,
        confirmButtonText: "OK",
      });
    } else {
      console.error("SweetAlert is not initialized properly");
    }
  };
  
  const handleOff = () => {
    sweetAlertForOff("Berhasil", "Perangkat telah dimatikan.", "success");
  };

  const userSchema = object({
    komponen: string().required("Komponen harus dipilih"),
    nama: string().required("Nama harus diisi"),
    nim: string().required("NIM harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
  
    // Validasi Nama: hanya huruf yang diterima
    if (name === "nama") {
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, ""); // Menghapus karakter selain huruf dan spasi
      formDataRef.current[name] = cleanedValue;
      e.target.value = cleanedValue;
    }
    // Validasi NIM: hanya angka yang diterima
    else if (name === "nim") {
      const numericValue = value.replace(/[^0-9]/g, ""); // Menghapus huruf, hanya angka yang diterima
      formDataRef.current[name] = numericValue;
      e.target.value = numericValue;
    }
    else {
      formDataRef.current[name] = value;
    }
  
    // Validasi input
    const validationError = await validateInput(name, value, userSchema);
  
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


  const handleClearForm = () => {
    // Reset form data
    formDataRef.current = {
      komponen: "",
      nama: "",
      nim: "",
    };
    setErrors({});
  };

  const handleToggleStatus = async (status) => {
    try {
      // Dapatkan waktu lokal dalam format yang sesuai untuk SQL Server
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  
      // Siapkan payload untuk endpoint UpdateStatus
      const payload = {
        kom_id: formDataRef.current.komponen, // komponen ID
        Waktu: timestamp,                    // waktu dalam format yang sesuai
        kondisi: status                      // status ON atau OFF
      };
  
      setIsLoading(true);
  
      // Kirim data ke backend (UpdateStatus)
      const response = await UseFetch(
        API_LINK + "TrsForm/UpdateStatus",
        payload,
        "POST"
      );
  
      // Validasi hasil dari endpoint UpdateStatus
      if (response === "ERROR" || response?.[0]?.Hasil !== "Data berhasil dimasukkan") {
        throw new Error(response?.[0]?.ErrorMessage || "Gagal memperbarui status penggunaan listrik.");
      }

      const kopi = {
        kom_id: formDataRef.current.komponen, // komponen ID
        kondisi: status                      // status ON atau OFF
      };

      const oi = await UseFetch(
        API_LINK + "MasterKomponen/SetSettingKomponenOnOff",
        kopi,
        "POST"
      );

      if (oi === "ERROR" || oi.length === 0) {
        throw new Error(oi?.[0]?.ErrorMessage || "Gagal memperbarui status penggunaan listrik.");
      } 
  
      // Siapkan dan kirim pesan MQTT
      const mqttMessage = `A01=${status};`; // Format pesan MQTT
      const mqttResponse = await UseFetch(
        API_LINK + "Mqtt/send",
        {
          topic: "ENERGYMONITORING2024",
          message: mqttMessage
        },
        "POST"
      );
  
      // Validasi hasil dari endpoint MQTT
      if (mqttResponse === "ERROR") {
        throw new Error(`Sedang tidak bisa digunakan ${status}`);
      }
      console.log(status);
      // Tampilkan pesan sukses dan perbarui status pengguna
      if (status === "ON") {
        setStatusMessage("Listrik telah dinyalakan. Gunakan dengan bijak untuk keperluan penting.");
      } else if (status === "OFF") {
        setIsDeviceOn(false); // Mematikan perangkat
        setStatusMessage("Listrik telah dimatikan. Terima kasih telah menghemat energi.");
        SweetAlert("Sukses", "Listrik telah dimatikan. Terima kasih telah menghemat energi.", "success")
          .then(() => {
              // Kembalikan ke halaman utama
              handleClearForm(); // Mengatur ulang form
              onChangePage("home"); // Halaman sebelumnya
          });
    }
    
    
  
      if (status === "ON") {
        setIsDeviceOn(true); // Perangkat dinyalakan
        setUsageTime(0); // Reset waktu berjalan
        setStatusMessage("Listrik telah dinyalakan. Gunakan dengan bijak untuk keperluan penting.");
        SweetAlert("Sukses", "Listrik dapat digunakan dan gunakan dengan bijak", "success");
      } else if (status === "OFF") {
        setIsDeviceOn(false); // Perangkat dimatikan
        setShowButtons(false);
        setStatusMessage("Listrik telah dimatikan. Terima kasih telah menghemat energi.");
        SweetAlert("Sukses", "Listrik telah dimatikan. Terima kasih telah menghemat energi.", "success");
      }      
    } catch (error) {
      setIsError({ error: true, message: error.message || "Terjadi kesalahan saat memperbarui status." });
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
    <div className="vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-primary text-white py-2 px-3">
        <div className="d-flex justify-content-between align-items-center">
          <img
            src={Logo}
            alt="Logo"
            style={{ height: "50px", objectFit: "contain", marginRight: "10px" }}
          />
          <h4 className="mb-0 text-end">Sistem Monitoring Penggunaan Listrik</h4>
        </div>
      </header>

      {/* Content */}
      <div className="container d-flex flex-column justify-content-center align-items-center flex-grow-1">
        {!showButtons ? (
          <form onSubmit={handleSaveData} className="w-30">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h3>Form Penggunaan Listrik</h3>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <DropDown
                      forInput="komponen"
                      label="Komponen"
                      arrData={listKomponen.length > 0 ? listKomponen : [{ value: "", label: "Memuat data..." }]}
                      isRequired
                      value={formDataRef.current.komponen}
                      onChange={handleInputChange}
                      errorMessage={errors.komponen}
                    />
                  </div>
                  <div className="col-lg-12 mb-3">
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
                  <div className="col-lg-12 mb-3">
                    <Input
                      type="text"
                      forInput="nim"
                      label="NIM"
                      isRequired
                      value={formDataRef.current.nim}
                      onChange={handleInputChange}
                      errorMessage={errors.nim}
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end">
                <Button
                  classType="secondary me-2 px-4 py-2"
                  label="BATAL"
                  onClick={handleClearForm}
                />
                <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label="SIMPAN"
                />
              </div>
            </div>
          </form>
        ) : (
          <form className="w-85 mx-auto">
            <div className="card shadow-lg rounded-lg border-10">
              <div className="card-header text-center bg-primary text-white">
                <h5 className="mb-0">Saklar Digital Penggunaan Listrik</h5>
              </div>
              <div className="card-body p-4">
                <p className="text-center mb-4 text-muted">
                  Gunakan listrik dengan bijak. Nyalakan listrik hanya saat dibutuhkan, 
                  dan matikan untuk menghemat energi.
                </p>
                <div className="d-flex justify-content-center mb-4">
                  <Button
                    classType="success px-4 py-2 me-3"
                    label="ON"
                    onClick={() => handleToggleStatus("ON")}
                  />
                  <Button
                    classType="danger px-4 py-2"
                    label="OFF"
                    onClick={() => handleToggleStatus("OFF")}

                  />
                </div>
                {statusMessage && (
                  <div className="alert alert-info mt-4 text-center">
                    {statusMessage}
                  </div>
                )}
                <div className="mt-3 text-center">
                  {isDeviceOn && (
                    <p>
                      Waktu berjalan: {Math.floor(usageTime / 60)} menit {usageTime % 60} detik
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
          <div className="fixed-bottom p-2 text-center bg-white">
            Copyright &copy; 2024 - PSI Politeknik Astra
          </div>
      </div>
    </div>
  );
}
