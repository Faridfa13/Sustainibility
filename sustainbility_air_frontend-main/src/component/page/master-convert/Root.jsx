import MasterKursProsesIndex from "./Index";
import MasterKursProsesConvert from "./Add"; // Import MasterKursProsesConvert

export default function MasterKursProses() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Form Add di atas grafik */}
      <MasterKursProsesConvert onChangePage={(page) => console.log(page)} />
      <MasterKursProsesIndex />
    </div>
  );
}
