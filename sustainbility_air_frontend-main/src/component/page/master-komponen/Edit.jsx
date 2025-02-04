import { useEffect, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";

export default function MasterKomponenEdit({ onChangePage, withID }) {
  const [formData, setFormData] = useState({
    noKomponen: "",
    jenis: "",
    ampere: "",
    kondisi: "",
  });

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false); // Tambahkan state untuk validasi form

  const userSchema = object({
    noKomponen: string().required("Nomor komponen harus diisi"),
    jenis: string().required("Jenis harus diisi"),
    ampere: string().required("Ampere harus diisi"),
    kondisi: string().required("Kondisi harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponen/GetDataKomponenById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data komponen.");
        } else {
          setFormData({
            noKomponen: data[0].noKomponen || '',
            jenis: data[0].jenis || '',
            ampere: data[0].ampere || '',
            kondisi: data[0].kondisi || '',
          });
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  useEffect(() => {
    // Periksa apakah semua field telah diisi
    const isValid = Object.values(formData).every((value) => value.trim() !== "");
    setIsFormValid(isValid);
  }, [formData]); // Jalankan setiap kali formData berubah

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError({ error: false, message: "" });
    setErrors({});
  
    // Validasi apakah semua field sudah diisi
    const isValid = Object.values(formData).every((value) => value.trim() !== "");
    if (!isValid) {
      SweetAlert("Error", "Semua field harus diisi sebelum menyimpan data.", "error");
      setIsLoading(false);
      return;
    }
  
    try {
      const activeUser = localStorage.getItem("username") || " ";
  
      const payload = {
        idKomponen: withID,
        noKomponen: formData.noKomponen,
        jenis: formData.jenis,
        ampere: formData.ampere,
        kondisi: formData.kondisi,
        activeUser: activeUser,
      };
  
      const response = await fetch(API_LINK + "MasterKomponen/EditKomponen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response || response === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data komponen.");
      } else if (response.status !== 200) {
        throw new Error(`Terjadi kesalahan: Status kode ${response.status}`);
      } else {
        SweetAlert("Sukses", "Data komponen berhasil disimpan", "success");
        onChangePage("index");
      }
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Komponen
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <label htmlFor="noKomponen" className="form-label">
                  Nomor Komponen
                </label>
                <p>{formData.noKomponen || "-"}</p>
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="jenis"
                  label="Jenis Komponen"
                  arrData={[
                    { Value: "Alat", Text: "Alat" },
                    { Value: "Mesin", Text: "Mesin" },
                    { Value: "Perangkat Lunak", Text: "Perangkat Lunak" },
                    { Value: "Lainnya", Text: "Lainnya" },
                  ]}
                  isRequired
                  value={formData.jenis}
                  onChange={handleInputChange}
                  errorMessage={errors.jenis}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="ampere"
                  label="Ampere (A)"
                  isRequired
                  value={formData.ampere}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      handleInputChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                      e.preventDefault();
                    }
                  }}
                  errorMessage={errors.ampere}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="kondisi"
                  label="Kondisi Komponen"
                  arrData={[
                    { Value: "Baik", Text: "Baik" },
                    { Value: "Rusak", Text: "Rusak" },
                  ]}
                  isRequired
                  value={formData.kondisi}
                  onChange={handleInputChange}
                  errorMessage={errors.kondisi}
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
            disabled={!isFormValid || isLoading} // Disable jika form tidak valid atau sedang loading
          />
        </div>
      </form>
    </>
  );
}
