using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace sistem_informasi_produksi_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorAirController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=DB_Sustainability;user id=sa;password=polman;";

        // Model SensorData didefinisikan di dalam SensorController
        public class SensorDataAir
        {
            public int kpn_id { get; set; }
            public double? volume { get; set; }
        }

        [HttpPost("AddDataAir")]
        public async Task<IActionResult> AddDataAir([FromBody] SensorDataAir data)
        {
            if (data == null || data.volume == null)
            {
                return BadRequest("Invalid data.");
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand("stn_createDataSensor", connection)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@kpn_id", data.kpn_id);
                command.Parameters.AddWithValue("@sns_volume", data.volume);

                try
                {
                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                    return Ok("Data added successfully");
                }
                catch (Exception ex)
                {
                    return BadRequest("Error: " + ex.Message);
                }
            }
        }
    }
}
