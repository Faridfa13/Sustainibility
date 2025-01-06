using Microsoft.AspNetCore.Mvc;
using sistem_informasi_produksi_backend;
using sistem_informasi_produksi_backend.Service;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class MqttController : ControllerBase
{
    private readonly MQTTService _mqttService;

    public MqttController(MQTTService mqttService)
    {
        _mqttService = mqttService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] MessageRequest request)
    {
        await _mqttService.PublishMessageAsync(request.Topic, request.Message);
        return Ok("Message sent successfully");
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] string topic)
    {
        await _mqttService.SubscribeAsync(topic);
        return Ok($"Subscribed to topic {topic}");
    }
}

public class MessageRequest
{
    public string Topic { get; set; }
    public string Message { get; set; }
    public string activeUser { get; set; }
}