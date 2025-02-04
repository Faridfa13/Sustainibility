using Microsoft.AspNetCore.Mvc;
using sistem_informasi_produksi_backend.Service;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace sistem_informasi_produksi_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=DB_Sustainabilit;user id=sa;password=polman;";
        private readonly SensorDataService _sensorDataService;

        public SensorController(SensorDataService sensorDataService)
        {
            _sensorDataService = sensorDataService;
        }

        [HttpPost("AddData")]
        public async Task<IActionResult> AddData([FromBody] SensorData data)
        {
            // Validasi data input
            if (data == null || string.IsNullOrWhiteSpace(data.SensorCode) ||
                data.Voltage == null || data.Current == null ||
                data.Power == null || data.Energy == null || data.Time == null)
            {
                return BadRequest("Invalid or incomplete data.");
            }

            // Simpan data ke dalam service (opsional)
            _sensorDataService.AddSensorData(data);

            // Simpan data ke database menggunakan stored procedure
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand("stn_UpdateDataSensor", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // Tambahkan parameter ke stored procedure
                command.Parameters.AddWithValue("@p1", data.SensorCode);
                command.Parameters.AddWithValue("@p2", data.Voltage);
                command.Parameters.AddWithValue("@p3", data.Current);
                command.Parameters.AddWithValue("@p4", data.Power); // Kolom Power
                command.Parameters.AddWithValue("@p5", data.Energy);
                command.Parameters.AddWithValue("@p6", data.Time);

                try
                {
                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return Ok("Data added successfully via Stored Procedure.");
                }
                catch (Exception ex)
                {
                    return BadRequest("Error inserting data: " + ex.Message);
                }
            }
        }
    }

    // Model untuk menerima data dari Body Request
    public class SensorData
    {
        public string SensorCode { get; set; } 
        public float?    Voltage { get; set; }   
        public float?    Current { get; set; }  
        public float?      Power { get; set; }      
        public float?     Energy { get; set; }   
        public int?         Time { get; set; }         
    }
}
