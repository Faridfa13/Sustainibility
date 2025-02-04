import { useRef, useState, useEffect } from "react"; // Tambahkan useEffect di sini
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterKomponenAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRuangan, setListRuangan] = useState({});

  const formDataRef = useRef({
    noKomponen: "",
    jenis: "",
    ampere: "",
    kondisi: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterRuangan/GetListRuangan", {});
        if (data === "ERROR") {
          throw new Error("Gagal mengambil daftar ruangan.");
        } else {
          setListRuangan(data); // Set room list
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListRuangan({});
      }
    };

    fetchData();
  }, []);

  const userSchema = object({
    noKomponen: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    jenis: string().required("harus dipilih"),
    ampere: string().required("harus diisi"),
    kondisi: string().required("harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
  
    if (name === "ampere") {
      // Ambil angka saja dari input
      const numericValue = value.replace(/[^\d]/g, ""); // Hanya angka
  
      // Simpan angka ke formDataRef
      formDataRef.current[name] = numericValue;
  
      // Update tampilan input dengan "A"
     // e.target.value = numericValue ? `${numericValue}A` : "";
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
        // Step 1: Periksa apakah No. Komponen sudah ada di database
        const checkResponse = await UseFetch(
          API_LINK + "MasterKomponen/CheckNoKomponen",
          { noKomponen: formDataRef.current.noKomponen },
          "POST"
        );        
        console.log(formDataRef.current.noKomponen);
        console.log(checkResponse[0].Jumlah);
        
        if (checkResponse[0].Jumlah > 0) {
          // Tampilkan pesan SweetAlert jika No. Komponen sudah ada
          SweetAlert("Error", "No. Komponen sudah ada, isi yang lain", "error");
          setIsLoading(false);
          return; // Hentikan proses jika duplikat
        }
  
        // Step 2: Lanjutkan proses penyimpanan jika tidak ada duplikasi
        const data = await UseFetch(
          API_LINK + "MasterKomponen/CreateKomponen",
          formDataRef.current
        );
  
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data komponen.");
        } else {
          SweetAlert("Sukses", "Data komponen berhasil disimpan", "success");
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
            Tambah Data Komponen Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              {/* <div className="col-lg-4">
                <DropDown
                  forInput="rgnId" // Ubah rgn_id ke rgnId
                  label="Ruangan"
                  arrData={listRuangan}
                  isRequired
                  value={formDataRef.current.rgnId} // Ubah rgn_id ke rgnId
                  onChange={handleInputChange}
                  errorMessage={errors.rgnId} // Ubah rgn_id ke rgnId
                />
              </div> */}
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="noKomponen"
                  label="No. Komponen"
                  isRequired
                  value={formDataRef.current.noKomponen}
                  onChange={handleInputChange}
                  errorMessage={errors.noKomponen}
                />
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
                  value={formDataRef.current.jenis}
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
                value={formDataRef.current.ampere ? formDataRef.current.ampere + "" : ""}
                onChange={handleInputChange}
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
                  value={formDataRef.current.kondisi}
                  onChange={handleInputChange}
                  errorMessage={errors.kondisi}
                />
              </div>
              {/* <div className="col-lg-4">
                <Input
                  type="number"
                  forInput="watt"
                  label="Watt"
                  value={formDataRef.current.watt}
                  onChange={handleInputChange}
                  errorMessage={errors.watt}
                />
              </div> */}
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
