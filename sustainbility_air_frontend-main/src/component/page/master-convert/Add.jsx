import React, { useState } from "react";
import axios from "axios";
import moment from "moment";
import SweetAlert from "../../util/SweetAlert"; // Pastikan SweetAlert diimpor dengan benar

const Add = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("date");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type !== "text/csv") {
      SweetAlert("Error", "Mohon masukkan file .csv, file lain tidak diperbolehkan!", "error");
      e.target.value = null; // Reset input file
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const formatDate = (date) => {
    const validFormats = [
      "DD-MM-YYYY",
      "MMM-YY",
      "MM/DD/YYYY",
      "DD/MM/YYYY",
      "YYYY-MM-DD",
    ];

    const formattedDate = moment(date, validFormats, true);
    if (!formattedDate.isValid()) {
      console.warn(`Invalid date format: ${date}`);
      return null;
    }
    return formattedDate.format("YYYY-MM-DD");
  };

  const formatTime = (time) => {
    const regex = /^(\d{2})\.(\d{2})\s([APM]{2})$/;
    const match = time.match(regex);

    if (match) {
      return time;
    } else {
      console.warn(`Invalid time format: ${time}`);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      SweetAlert("Error", "Please select a CSV file first.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      let content = reader.result;

      const rows = content.trim().split("\n");
      const formattedRows = rows.map((row, index) => {
        if (index === 0) return row;

        const columns = row.split(";").map((col) => col.trim());

        if (format === "time") {
          const formattedTime = formatTime(columns[0]);
          if (!formattedTime) {
            SweetAlert("Error", `Invalid time format in row ${index + 1}: ${columns[0]}`, "error");
            throw new Error(`Invalid time format in row ${index + 1}`);
          }
          columns[0] = formattedTime;
        } else if (format === "date") {
          const formattedDate = formatDate(columns[0]);
          if (!formattedDate) {
            SweetAlert("Error", `Invalid date format in row ${index + 1}: ${columns[0]}`, "error");
            throw new Error(`Invalid date format in row ${index + 1}`);
          }
          columns[0] = formattedDate;
        }

        return columns.join(";");
      });

      content = formattedRows.join("\n");

      const formData = new FormData();
      formData.append("file", new Blob([content], { type: "text/csv" }), file.name);
      formData.append("format", format);

      try {
        setIsLoading(true);
        const result = await axios.post(
          `http://localhost:5255/api/Import/import-csv?format=${format}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (result.status === 200) {
          setIsSuccess(true);
          SweetAlert("Success", "File uploaded successfully.", "success");
          setTimeout(() => setIsSuccess(false), 3000);
        } else {
          SweetAlert("Error", "Failed to upload CSV file.", "error");
        }
      } catch (err) {
        console.error("Error response:", err.response);
        if (err.response && err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors)
            .flat()
            .join("\n");
          SweetAlert("Error", `Upload error:\n${errorMessages}`, "error");
        } else if (err.response && err.response.data) {
          SweetAlert("Error", `Upload error: ${err.response.data.title || "Unknown error"}`, "error");
        } else {
          SweetAlert("Error", "An error occurred while uploading the file.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="container" style={{ padding: "20px 0" }}>
      <div
        className="card shadow-sm"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3 className="text-center mb-4">Import CSV Data</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="fileInput" style={{ fontWeight: "bold" }}>
              Select CSV File:
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="form-control"
              accept=".csv"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="formatSelect" style={{ fontWeight: "bold" }}>
              Select Format:
            </label>
            <select
              id="formatSelect"
              className="form-select"
              value={format}
              onChange={handleFormatChange}
            >
              <option value="date">Date</option>
              <option value="time">Time</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ marginTop: "20px" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                {" Uploading..."}
              </span>
            ) : (
              "Upload CSV"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
