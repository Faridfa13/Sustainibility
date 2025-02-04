using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace sistem_informasi_produksi_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UploadController(IWebHostEnvironment hostingEnvironment) : Controller
    {
        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                string fileName = "FILE_" +
                    Guid.NewGuid() +
                    "_" +
                    DateTime.Now.Year +
                    DateTime.Now.Month +
                    DateTime.Now.Day +
                    DateTime.Now.Hour +
                    DateTime.Now.Minute +
                    DateTime.Now.Second;

                if (file == null || file.Length == 0)
                    return BadRequest("Berkas tidak ada/tidak valid.");

                string uploadDirectory = Path.Combine(hostingEnvironment.WebRootPath, "Uploads");
                if (!Directory.Exists(uploadDirectory))
                    Directory.CreateDirectory(uploadDirectory);
                string filePath = Path.Combine(uploadDirectory, fileName + Path.GetExtension(file.FileName));

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                return Ok(JsonConvert.SerializeObject(new { Hasil = fileName + Path.GetExtension(file.FileName) }));
            }
            catch { return BadRequest(); }
        }
    }
}
