using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using sistem_informasi_produksi_backend.Helper;
using sistem_informasi_produksi_backend.Service;
using System.Data;

namespace sistem_informasi_produksi_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class TrsFormController(IConfiguration configuration) : Controller
    {
        private readonly PolmanAstraLibrary.PolmanAstraLibrary _lib;
        readonly PolmanAstraLibrary.PolmanAstraLibrary lib = new(configuration.GetConnectionString("DefaultConnection"));
        DataTable dt = new();


        [HttpPost]
        public IActionResult GetSensorData([FromBody] dynamic data)
        {
            try
            {
                Console.WriteLine(data.ToString());
                JObject value = JObject.Parse(data.ToString());
                dt = lib.CallProcedure("stn_getFormSensor", EncodeData.HtmlEncodeObject(value));
                return Ok(JsonConvert.SerializeObject(dt));
            }
            catch { return BadRequest(); }
        }

        [HttpPost]
        public IActionResult DataPenggunaan([FromBody] dynamic data)
        {
            try
            {
                Console.WriteLine(data.ToString());
                JObject value = JObject.Parse(data.ToString());
                dt = lib.CallProcedure("stn_detailDataPenggunaan", EncodeData.HtmlEncodeObject(value));
                return Ok(JsonConvert.SerializeObject(dt));
            }
            catch { return BadRequest(); }
        }

        [HttpPost]
        public IActionResult UpdateStatus([FromBody] dynamic data)
        {
            try
            {
                Console.WriteLine(data.ToString());
                JObject value = JObject.Parse(data.ToString());
                dt = lib.CallProcedure("stn_updateDataPenggunaan", EncodeData.HtmlEncodeObject(value));
                return Ok(JsonConvert.SerializeObject(dt));
            }
            catch { return BadRequest(); }
        }

    }
}






//    }
//}
/*
[HttpPost]
public IActionResult stn_detailDataPenggunaan([FromBody] dynamic data)
{
    try
    {
        var sensorData = _sensorDataService.GetSensorData();
        foreach (var item in sensorData)
        {
            Console.WriteLine($"SensorCode: {item.SensorCode}, Voltage: {item.Voltage}");
        }

        JObject value = JObject.Parse(data.ToString());
        _dt = _lib.CallProcedure("stn_detailKomponen", EncodeData.HtmlEncodeObject(value));
        return Ok(JsonConvert.SerializeObject(_dt));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
        return BadRequest(new { Message = "Gagal pengisisan data diri.", Error = ex.Message });
    }
}

[HttpPost]
public IActionResult stn_detailDataSensor([FromBody] dynamic data)
{
    try
    {
        JObject value = JObject.Parse(data.ToString());
        _dt = _lib.CallProcedure("stn_getFormSensor", EncodeData.HtmlEncodeObject(value));
        return Ok(JsonConvert.SerializeObject(_dt));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
        return BadRequest(new { Message = "Gagal mendapatkan data form sensor.", Error = ex.Message });
    }
}*/