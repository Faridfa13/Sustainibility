import { useEffect, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterRuanganEdit({ onChangePage, withID }) {
  const [formData, setFormData] = useState({
    idRuangan: "",
    namaRuangan: "",
    lantai: "",
    gedung: "",
  });
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const ruanganSchema = object({
    idRuangan: string().required("ID Ruangan harus ada."), // Validasi ID wajib ada
    namaRuangan: string().required("Nama ruangan harus diisi"),
    lantai: string().required("Lantai harus diisi"),
    gedung: string().required("Gedung harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(API_LINK + "MasterRuangan/GetDataRuanganById", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data ruangan.");
        } else {
          setFormData({
            idRuangan: data[0].idRuangan || '',
            namaRuangan: data[0].namaRuangan || '',
            lantai: data[0].lantai || '',
            gedung: data[0].gedung || '',
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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "namaRuangan") {
      // Hapus angka dari input nama ruangan
      const cleanedValue = value.replace(/[0-9]/g, ""); // Hanya huruf yang diterima
      setFormData((prevData) => ({
        ...prevData,
        [name]: cleanedValue,
      }));
      e.target.value = cleanedValue;
    } else if (name === "lantai") {
      // Hanya ambil angka untuk lantai
      const numericValue = value.replace(/[^\d]/g, ""); // Hanya angka
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));
      e.target.value = numericValue;
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Validasi input
    const validationError = await validateInput(name, value, ruanganSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      ruanganSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(API_LINK + "MasterRuangan/EditRuangan", formData);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data ruangan.");
        } else {
          SweetAlert("Sukses", "Data ruangan berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleSave}>
        <div className="card">
          <div className="card-header bg-primary text-white">
            Ubah Data Ruangan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  name="namaRuangan"
                  label="Nama Ruangan"
                  value={formData.namaRuangan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaRuangan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  name="lantai"
                  label="Lantai"
                  value={formData.lantai}
                  onChange={handleInputChange}
                  errorMessage={errors.lantai}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  name="gedung"
                  label="Gedung"
                  value={formData.gedung}
                  onChange={handleInputChange}
                  errorMessage={errors.gedung}
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
    </>
  );
}
