import { useState, useEffect, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../part/Button";

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function PowerDataChart() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState("bar");
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [sensorData, setSensorData] = useState([]);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Generate fallback data when no data is found
  const generateFallbackData = () => {
    const labels = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "long" })
    );
    const zeroData = Array(12).fill(0);

    return {
      labels,
      datasets: [
        {
          label: `Total Energy (Kwh)(Tahun ${year})`,
          data: zeroData,
          borderColor: "black", // Warna bingkai bar
          borderWidth: 2,
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
            "#E7E9ED", "#76C7C0", "#F45B69", "#8A6EDE", "#F9E076", "#D291BC",
          ],
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    const fetchBarData = async () => {
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const response = await axios.get("http://localhost:5255/api/Import/powerdata", {
          params: { startDate, endDate },
        });

        const data = response.data;

        // Use fallback data if no data found
        if (!Array.isArray(data) || data.length === 0) {
          const fallbackData = generateFallbackData();
          setBarChartData(fallbackData);
          setLineChartData(fallbackData);
          return;
        }

        const monthlyTotals = Array(12).fill(0);
        data.forEach((item) => {
          const month = new Date(item.Period).getMonth();
          monthlyTotals[month] += item.TotalEnergy || 0;
        });

        const labels = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("default", { month: "long" })
        );

        setBarChartData({
          labels,
          datasets: [
            {
              label: `Total Energy (Kwh)(Tahun ${year})`,
              data: monthlyTotals,
              borderColor: "black", // Warna bingkai bar
              borderWidth: 2,
              backgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
                "#E7E9ED", "#76C7C0", "#F45B69", "#8A6EDE", "#F9E076", "#D291BC",
              ],
              borderColor: "rgba(0,0,0,0.1)",
              borderWidth: 1,
            },
          ],
        });

        setLineChartData({
          labels,
          datasets: [
            {
              label: `Total Energy (Tahun ${year})`,
              data: monthlyTotals,
              borderColor: "black",
              borderWidth: 1,
              backgroundColor: "rgba(0,0,0,0.1)",
              backgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
                "#E7E9ED", "#76C7C0", "#F45B69", "#8A6EDE", "#F9E076", "#D291BC",
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching Bar Chart data:", error);
        // Use fallback data in case of error
        const fallbackData = generateFallbackData();
        setBarChartData(fallbackData);
        setLineChartData(fallbackData);
      }
    };

    const fetchSensorData = async () => {
      try {
        const response = await axios.get("http://localhost:5255/api/Import/energybynim");
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
          // Set an empty array instead of showing an alert
          setSensorData([]);
          return;
        }

        setSensorData(data);
      } catch (error) {
        console.error("Error fetching Sensor data:", error);
        // Set an empty array in case of error
        setSensorData([]);
      }
    };

    fetchBarData();
    fetchSensorData();
  }, [year]);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartRef.current) {
      chartInstanceRef.current = new ChartJS(chartRef.current, {
        type: chartType,
        data: chartType === "bar" ? barChartData : lineChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              //text: `Power Data ${chartType === "bar" ? "Bar" : "Line"} Chart (Tahun ${year})`,
            },
            tooltip: {
              backgroundColor: "#ffffff",
              titleColor: "#000",
              bodyColor: "#000",
              callbacks: {
                label: function (context) {
                  const value = context.raw; // Nilai data yang sedang diarahkan
                  return `${context.dataset.label}: ${value} Kwh`; // Tambahkan satuan "Kwh"
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartType, barChartData, lineChartData]);

  const exportToExcel = () => {
    if (!barChartData) return;

    const currentDate = new Date().toLocaleDateString();
    const dataToExport = [
      [`Tanggal Dibuat: ${currentDate}`],
      ["Bulan", "Total Energy"],
      ...barChartData.labels.map((label, index) => [
        label,
        barChartData.datasets[0].data[index],
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Power Data ${year}`);

    XLSX.writeFile(workbook, `PowerData_${year}_${currentDate}.xlsx`);
  };

  const [sortOrder, setSortOrder] = useState({ column: '', order: 'asc' });

  // Sorting Function
  const sortData = (column) => {
    // Toggle between ascending and descending order
    const newOrder = sortOrder.column === column && sortOrder.order === 'asc' ? 'desc' : 'asc';
    setSortOrder({ column, order: newOrder });
  
    const sortedData = [...sensorData].sort((a, b) => {
      if (typeof a[column] === "string") {
        return newOrder === 'asc'
          ? a[column].localeCompare(b[column])
          : b[column].localeCompare(a[column]);
      } else {
        return newOrder === 'asc'
          ? a[column] - b[column]
          : b[column] - a[column];
      }
    });
  
    setSensorData(sortedData);
  };

  // Modified to always render, even without data
  return (
    <div style={containerStyle}>
      <h3 style={{ ...tableHeaderStyle, backgroundColor: "blue", color: "white" }}>
        Grafik Power Data Penggunaan Listrik (Tahunan (Kwh))
      </h3>

      <div style={controlsStyle}>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={selectStyle}
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button onClick={exportToExcel} style={buttonStyle(true, "#007bff")}>
          Export to Excel
        </button>
      </div>

      <div className="chart-container" style={chartContainerStyle}>
        <canvas ref={chartRef} />
      </div>

      <div style={buttonGroupStyle}>
        <button onClick={() => setChartType("bar")} style={buttonStyle(chartType === "bar")}>
          Bar Chart
        </button>
        <button onClick={() => setChartType("line")} style={buttonStyle(chartType === "line")}>
          Line Chart
        </button>
      </div>

      <div style={tableContainerStyle}>
        <h3 style={{ ...tableHeaderStyle, backgroundColor: "blue", color: "white" }}>
          Top 10 Penggunaan Energi Terbanyak
        </h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderCellStyle}>No</th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_nim')}
              >
                NIM  {sortOrder.column === 'sen_nim' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_nama')}
              >
                Nama Pengguna {sortOrder.column === 'sen_nama' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_voltage')}
              >
                Voltage(V) {sortOrder.column === 'sen_voltage' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_power')}
              >
                Power(Watt) {sortOrder.column === 'sen_power' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_current')}
              >
                Current(A)  {sortOrder.column === 'sen_current' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_energy')}
              >
                Energy(Kwh)  {sortOrder.column === 'sen_energy' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
              <th
                style={tableHeaderCellStyle}
                onClick={() => sortData('sen_time')}
              >
                Waktu Penggunaan(Menit) {sortOrder.column === 'sen_time' ? (sortOrder.order === 'asc' ? '↑' : '↓') : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sensorData.length > 0 ? (
              sensorData.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{index + 1}</td>
                  <td style={tableCellStyle}>{item.sen_nim}</td>
                  <td style={tableCellStyle}>{item.sen_nama}</td>
                  <td style={tableCellStyle}>{item.sen_voltage}</td>
                  <td style={tableCellStyle}>{item.sen_power}</td>
                  <td style={tableCellStyle}>{item.sen_current}</td>
                  <td style={tableCellStyle}>{item.sen_energy}</td>
                  <td style={tableCellStyle}>{item.sen_time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{...tableCellStyle, textAlign: 'center'}}>
                  Tidak ada data tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
          
  );
}

// Style Helpers
const containerStyle = {
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const headerStyle = {
  textAlign: "center",
  color: "#333",
};

const controlsStyle = {
  marginBottom: "20px",
  textAlign: "center",
};

const selectStyle = {
  padding: "10px",
  borderRadius: "5px",
  marginRight: "10px",
};

const buttonStyle = (active, color = "#007bff") => ({
  padding: "10px 20px",
  margin: "5px",
  backgroundColor: active ? color : "#e0e0e0",
  color: active ? "white" : "black",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
});

const chartContainerStyle = {
  position: "relative",
  height: "400px",
  marginBottom: "30px",
};

const buttonGroupStyle = {
  textAlign: "center",
  marginBottom: "20px",
};

const tableContainerStyle = {
  marginTop: "30px",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const tableHeaderStyle = {
  backgroundColor: "#f2f2f2",
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center",
};

const tableHeaderCellStyle = {
  padding: "10px",
  textAlign: "center",
  fontWeight: "bold",
  backgroundColor: "#f2f2f2",
  border: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  textAlign: "center",
  border: "1px solid #ddd",
};