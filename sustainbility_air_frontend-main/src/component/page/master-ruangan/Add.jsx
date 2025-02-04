import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterRuanganAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    namaRuangan: "",
    lantai: "",
    gedung: "",
  });

  const userSchema = object({
    namaRuangan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    lantai: string()
      .max(5, "maksimum 5 karakter")
      .required("harus diisi"),
    gedung: string().required("harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "namaRuangan") {
      // Hapus angka dari input nama ruangan
      const cleanedValue = value.replace(/[0-9]/g, ""); // Hanya huruf yang diterima
      formDataRef.current[name] = cleanedValue;
      e.target.value = cleanedValue;
    } else if (name === "lantai") {
      // Hanya ambil angka untuk lantai
      const numericValue = value.replace(/[^\d]/g, ""); // Hanya angka
      formDataRef.current[name] = numericValue;
      e.target.value = numericValue;
    } else {
      // Untuk input lain, simpan langsung
      formDataRef.current[name] = value;
    }

    // Validasi input
    const validationError = await validateInput(name, formDataRef.current[name], userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterRuangan/CreateRuangan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data ruangan.");
        } else {
          SweetAlert("Sukses", "Data ruangan berhasil disimpan", "success");
          onChangePage("index");
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
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Ruangan Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="namaRuangan"
                  label="Nama Ruangan"
                  isRequired
                  value={formDataRef.current.namaRuangan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaRuangan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="lantai"
                  label="Lantai"
                  isRequired
                  value={formDataRef.current.lantai}
                  onChange={handleInputChange}
                  errorMessage={errors.lantai}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="gedung"
                  label="Gedung"
                  isRequired
                  value={formDataRef.current.gedung}
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
