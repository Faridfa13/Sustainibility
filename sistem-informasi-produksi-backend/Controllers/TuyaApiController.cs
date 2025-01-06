using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace sistem_informasi_produksi_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class TuyaApiController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        private const string KeyTuyaAccessToken = "tuya:access_token";
        private const string KeyTuyaTokenRes = "tuya:token_res";

        public TuyaApiController(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        // Model untuk menerima data dari body request
        public class TuyaCommandRequest
        {
            public bool SwitchStatus { get; set; } // Hanya butuh status switch
        }

        [HttpPost]
        public async Task<IActionResult> SendTuyaCommand([FromBody] TuyaCommandRequest data)
        {
            try
            {
                // Akses nilai dari konfigurasi
                var baseUrl = _configuration["TuyaApi:BaseUrl"];
                var deviceId = _configuration["TuyaApi:DeviceId"];

                // Memastikan token yang valid tersedia
                var accessToken = await GetAccessToken();

                // Membentuk URL API Tuya
                var url = $"/v1.0/devices/{deviceId}/commands";

                // Payload untuk switch
                var payload = new
                {
                    commands = new[]
                    {
                        new { code = "switch_1", value = data.SwitchStatus }
                    }
                };

                // Serialize payload
                var jsonPayload = JsonConvert.SerializeObject(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Mengatur header untuk permintaan ke API Tuya
                var headers = GetHeaders("POST", url, jsonPayload, accessToken);
                foreach (var header in headers)
                {
                    _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                }

                // Kirim perintah ke API Tuya
                var response = await _httpClient.PostAsync(baseUrl + url, content);
                if (response.IsSuccessStatusCode)
                {
                    return Ok(new { message = "Command sent successfully" });
                }
                else
                {
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { message = "Error sending command to Tuya", details = errorMessage });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "An error occurred", details = ex.Message });
            }
        }

        private async Task<string> GetAccessToken()
        {
            if (CacheHelper.TryGet(KeyTuyaAccessToken, out string accessToken))
            {
                return accessToken;
            }

            var tokenResponse = await RequestNewToken();
            if (tokenResponse.Success)
            {
                accessToken = tokenResponse.Result["access_token"];
                CacheHelper.Set(KeyTuyaAccessToken, accessToken, TimeSpan.FromSeconds(tokenResponse.Result["expire_time"]));
                CacheHelper.Set(KeyTuyaTokenRes, tokenResponse.Result, TimeSpan.FromSeconds(tokenResponse.Result["expire_time"] + 3600));
            }

            return accessToken;
        }

        private async Task<dynamic> RequestNewToken(string refreshToken = "")
        {
            var baseUrl = _configuration["TuyaApi:BaseUrl"];
            var accessId = _configuration["TuyaApi:AccessId"];
            var accessSecret = _configuration["TuyaApi:AccessSecret"];

            var url = string.IsNullOrEmpty(refreshToken) ? "/v1.0/token?grant_type=1" : $"/v1.0/token/{refreshToken}";

            var headers = GetHeaders("GET", url, string.Empty, string.Empty);
            var request = new HttpRequestMessage(HttpMethod.Get, baseUrl + url);
            foreach (var header in headers)
            {
                request.Headers.Add(header.Key, header.Value);
            }

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<dynamic>(content);
        }

        private Dictionary<string, string> GetHeaders(string method, string url, string body, string accessToken)
        {
            var accessId = _configuration["TuyaApi:AccessId"];
            var accessSecret = _configuration["TuyaApi:AccessSecret"];
            string nonce = Guid.NewGuid().ToString();
            long t = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            string stringToSign = $"{method}\n{SHA256Hash(body)}\n\n{url}";

            string sign = GenerateSign(accessId, accessToken, t, nonce, stringToSign, accessSecret);

            var headers = new Dictionary<string, string>
            {
                { "client_id", accessId },
                { "sign_method", "HMAC-SHA256" },
                { "t", t.ToString() },
                { "nonce", nonce },
                { "sign", sign }
            };

            if (!string.IsNullOrEmpty(accessToken))
            {
                headers.Add("access_token", accessToken);
            }

            return headers;
        }

        private string SHA256Hash(string text)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(text));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }

        private string GenerateSign(string accessId, string accessToken, long t, string nonce, string stringToSign, string accessSecret)
        {
            string dataToSign = accessId + accessToken + t + nonce + stringToSign;
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(accessSecret)))
            {
                var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign));
                return BitConverter.ToString(bytes).Replace("-", "").ToUpper();
            }
        }
    }

    public static class CacheHelper
    {
        private static Dictionary<string, object> _cache = new Dictionary<string, object>();
        private static Dictionary<string, DateTime> _expiration = new Dictionary<string, DateTime>();

        public static void Set(string key, object value, TimeSpan expiration)
        {
            _cache[key] = value;
            _expiration[key] = DateTime.UtcNow.Add(expiration);
        }

        public static bool TryGet<T>(string key, out T value)
        {
            if (_cache.ContainsKey(key) && _expiration[key] > DateTime.UtcNow)
            {
                value = (T)_cache[key];
                return true;
            }

            value = default;
            return false;
        }
    }
}
