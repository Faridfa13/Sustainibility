import Icon from "./Icon";

export default function Table({
  data,
  onToggle = () => {},
  onOnoff = () => {},
  onCancel = () => {},
  onDelete = () => {},
  onDetail = () => {},
  onEdit = () => {},
  onApprove = () => {},
  onReject = () => {},
  onSent = () => {},
}) {
  let colPosition;
  let colCount = 0;

  function generateActionButton(columnName, value, key, id, status, onoff, nokomponen) {
    if (columnName !== "Aksi" && columnName !== "Kabar") return value;

    const listButton = value.map((action) => {
      switch (action) {
        case "Toggle":
          return (
            <Icon
              key={key + action}
              name={status === "Aktif" ? "toggle-on" : "toggle-off"}
              type="Bold"
              cssClass={`btn px-1 py-0 text-${status === "Aktif" ? "primary" : "secondary"}`}
              title={status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
              onClick={() => onToggle(id)}
            />
          );
        case "Onoff":
          return (
            <Icon
              key={key + action}
              name={onoff === 1 || onoff === "ON"
                ? "toggle-on" : "toggle-off"}
              type="Bold"
              cssClass={`btn px-1 py-0 text-${onoff === 1 || onoff === "ON" ? "primary" : "secondary"}`}
              title={onoff === 1 || onoff === "ON" ? "Matikan" : "Hidupkan"}
              onClick={() => onOnoff(id, nokomponen, onoff)}
            />
          );
        case "Cancel":
          return (
            <Icon
              key={key + action}
              name="delete-document"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Batalkan"
              onClick={onCancel}
            />
          );
        case "Delete":
          return (
            <Icon
              key={key + action}
              name="trash"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Hapus"
              onClick={() => onDelete(id)}
            />
          );
        case "Detail":
          return (
            <Icon
              key={key + action}
              name="overview"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Lihat Detail"
              onClick={() => onDetail("detail", id)}
            />
          );
        case "Edit":
          return (
            <Icon
              key={key + action}
              name="edit"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Ubah"
              onClick={() => onEdit("edit", id)}
            />
          );
        case "Approve":
          return (
            <Icon
              key={key + action}
              name="check"
              type="Bold"
              cssClass="btn px-1 py-0 text-success"
              title="Setujui Pengajuan"
              onClick={onApprove}
            />
          );
        case "Reject":
          return (
            <Icon
              key={key + action}
              name="cross"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Tolak Pengajuan"
              onClick={onReject}
            />
          );
        case "Sent":
          return (
            <Icon
              key={key + action}
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim"
              onClick={onSent}
            />
          );
        default:
          return null;
      }
    });

    return listButton;
  }

  return (
    <div className="flex-fill">
      <table className="table table-hover table-striped table-light border">
        <thead>
          <tr>
            {Object.keys(data[0]).map((value, index) => {
              if (value !== "Key" && value !== "Count" && value !== "Alignment" && value !== "RowStyle") {
                colCount++;
                return (
                  <th key={"Header" + index} className="text-center">
                    {value}
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {data[0].Count !== 0 &&
            data.map((row, rowIndex) => {
              colPosition = -1;

              // Tentukan kelas RowStyle berdasarkan nilai Setting
              let rowStyle = "";
              if (row.Setting === "ON") {
                rowStyle = "table-success"; // Warna hijau
              } else if (row.Setting === "OFF") {
                rowStyle = "table-danger"; // Warna merah
              }

              return (
                <tr
                  key={row["Key"]}
                  className={rowStyle} // Terapkan kelas warna ke baris
                >
                  {Object.keys(row).map((column, colIndex) => {
                    if (column !== "Key" && column !== "Count" && column !== "Alignment" && column !== "RowStyle") {
                      colPosition++;
                      return (
                        <td
                          key={rowIndex + "" + colIndex}
                          style={{
                            textAlign: row["Alignment"] ? row["Alignment"][colPosition] : "center",
                          }}
                        >
                          {generateActionButton(
                            column,
                            row[column],
                            "Action" + rowIndex + colIndex,
                            row["Key"],
                            row["Status"],
                            row["Setting"],
                            row["No Komponen"]
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          {data[0].Count === 0 && (
            <tr>
              <td colSpan={colCount}>Tidak ada data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
