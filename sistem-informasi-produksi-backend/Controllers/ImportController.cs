using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using Dapper;
using System.Globalization;
using System.Data;

[Route("api/[controller]")]
[ApiController]
public class ImportController : ControllerBase
{
    private readonly IConfiguration _configuration;
    public ImportController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    [HttpPost("import-csv")]
    public async Task<IActionResult> ImportCsv(IFormFile file, [FromQuery] string format)
    {
        // Periksa apakah file null
        if (file == null || file.Length == 0)
            return BadRequest("File CSV tidak ditemukan");

        // Validasi apakah format dikirimkan
        if (string.IsNullOrWhiteSpace(format))
            return BadRequest("Parameter format harus dikirimkan ('date' atau 'time').");

        // Normalisasi format ke lowercase untuk konsistensi
        format = format.ToLower();

        // Validasi apakah format sesuai dengan yang diharapkan
        if (format != "date" && format != "time")
            return BadRequest($"Format tidak dikenali: {format}. Hanya 'date' atau 'time' yang didukung.");

        using var reader = new StreamReader(file.OpenReadStream());
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        string line;
        bool isHeader = true;
        int lineNumber = 0;

        // Format yang didukung
        var supportedDateFormats = new[] { "dd/MM/yyyy", "MM/yyyy", "yyyy-MM-dd", "MMM-yy" };
        var supportedTimeFormat = "HH.mm tt";

        while ((line = await reader.ReadLineAsync()) != null)
        {
            lineNumber++;
            if (isHeader) { isHeader = false; continue; }

            try
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                var parts = line.Split(';');
                if (parts.Length != 2)
                    return BadRequest($"Format data tidak sesuai pada baris {lineNumber}: {line}");

                string timeString = parts[0].Trim();  // Data waktu
                string powerString = parts[1].Trim();  // Data power

                // Validasi power string tidak boleh kosong
                if (string.IsNullOrWhiteSpace(powerString))
                    return BadRequest($"Nilai power kosong pada baris {lineNumber}");

                // Normalisasi format power string
                powerString = powerString.Replace(".", "").Replace(",", ".").Trim();

                object timeParameter = null;

                // Cek format berdasarkan parameter format
                if (format == "time")
                {
                    DateTime parsedTime;

                    // Pastikan waktu sesuai dengan format yang diterima: HH.mm tt
                    if (DateTime.TryParseExact(timeString, supportedTimeFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedTime))
                    {
                        timeParameter = parsedTime; // Assign to timeParameter after parsing
                        Console.WriteLine($"Waktu yang diproses: {parsedTime}");
                    }
                    else
                    {
                        return BadRequest($"Format waktu tidak sesuai pada baris {lineNumber}: {timeString}");
                    }
                }
                else if (format == "date")
                {
                    // Proses jika formatnya tanggal
                    DateTime parsedDate;
                    bool validDate = false;
                    foreach (var formatOption in supportedDateFormats)
                    {
                        if (DateTime.TryParseExact(timeString, formatOption, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
                        {
                            timeParameter = parsedDate;
                            validDate = true;
                            break;
                        }
                    }

                    if (!validDate)
                    {
                        return BadRequest($"Format tanggal tidak sesuai pada baris {lineNumber}: {timeString}");
                    }
                }

                decimal? power;
                if (powerString == "-")
                {
                    power = null;
                }
                else if (decimal.TryParse(powerString, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal parsedPower))
                {
                    if (parsedPower < -1000000 || parsedPower > 1000000)
                        return BadRequest($"Nilai power tidak valid pada baris {lineNumber}: {parsedPower}. " +
                            "Nilai harus berada dalam range yang valid.");

                    power = Math.Round(parsedPower, 2, MidpointRounding.AwayFromZero);
                }
                else
                {
                    return BadRequest($"Format power tidak sesuai pada baris {lineNumber}: '{powerString}'");
                }

                var parameters = new DynamicParameters();
                parameters.Add("@TimePeriod", timeParameter ?? (object)DBNull.Value);
                parameters.Add("@Power", power.HasValue ? power.Value : (object)DBNull.Value);

                await connection.ExecuteAsync("stn_createPowerData", parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error pada baris {lineNumber}: {line}, Detail: {ex.Message}");
            }
        }

        return Ok("Data CSV berhasil diimpor");
    }


    [HttpGet("powerdata-graph")]
    public async Task<IActionResult> GetPowerDataForGraph()
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var data = await connection.QueryAsync("stn_getPowerDataForGraph", commandType: CommandType.StoredProcedure);

        return Ok(data);
    }

    [HttpGet("powerdata")]
    public async Task<IActionResult> GetPowerDataForGraph([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        var parameters = new DynamicParameters();
        parameters.Add("@p1", string.IsNullOrEmpty(startDate) ? DBNull.Value : startDate);
        parameters.Add("@p2", string.IsNullOrEmpty(endDate) ? DBNull.Value : endDate);

        var data = await connection.QueryAsync(
            "stn_getPowerData",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return Ok(data);
    }

    [HttpGet("energybynim")]
    public async Task<IActionResult> GetEnergyByNim() // No need for parameter from query string
    {
        try
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

            // Memanggil stored procedure tanpa parameter
            var data = await connection.QueryAsync<dynamic>(
                "stn_getEnergyByNim", // Nama stored procedure yang telah diperbarui
                commandType: CommandType.StoredProcedure // Menentukan jenis perintah sebagai stored procedure
            );

            // Mengembalikan data yang ditemukan
            return Ok(data);
        }
        catch (Exception ex)
        {
            // Mengembalikan error jika terjadi masalah
            return BadRequest(new { message = ex.Message });
        }
    }



}