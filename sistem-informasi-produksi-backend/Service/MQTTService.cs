using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Options;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using sistem_informasi_produksi_backend.Models;  // Impor SensorData dari Models

namespace sistem_informasi_produksi_backend.Service
{
    public class MQTTService
    {
        private IMqttClient _mqttClient;

        public MQTTService()
        {
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            _mqttClient.UseApplicationMessageReceivedHandler(e =>
            {
                var topic = e.ApplicationMessage.Topic;
                var message = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                Console.WriteLine($"Pesan diterima dari topik {topic}: {message}");

                // Mengirim data ke API dengan format yang tepat
                var sensorData = new SensorData
                {
                    kpn_id = GetKpnIdFromTopic(topic),
                    volume = float.Parse(message)
                };

                SendDataToApi(sensorData);
            });
        }

        private int GetKpnIdFromTopic(string topic)
        {
            if (topic.Contains("hulu"))
                return 21;
            if (topic.Contains("hilir1"))
                return 22;
            if (topic.Contains("hilir2"))
                return 23;
            return 0;
        }

        private async void SendDataToApi(SensorData data)
        {
            using (var client = new HttpClient())
            {
                var url = "http://192.168.4.58:5255/api/sensor/AddDataAir";
                var content = new StringContent(
                    $"{{\"kpn_id\": {data.kpn_id}, \"volume\": {data.volume}}}",
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await client.PostAsync(url, content);
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Data successfully sent to the API.");
                }
                else
                {
                    Console.WriteLine($"Failed to send data. Status Code: {response.StatusCode}");
                }
            }
        }

        public async Task ConnectAsync()
        {
            var options = new MqttClientOptionsBuilder()
                .WithClientId("AspNetCoreClient")
                .WithTcpServer("astratech.id", 1883)
                .Build();

            await _mqttClient.ConnectAsync(options, CancellationToken.None);
        }

        public async Task PublishMessageAsync(string topic, string message)
        {
            var mqttMessage = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(Encoding.UTF8.GetBytes(message))
                .WithExactlyOnceQoS()
                .WithRetainFlag(false)
                .Build();

            if (!_mqttClient.IsConnected)
            {
                await ConnectAsync();
            }

            await _mqttClient.PublishAsync(mqttMessage, CancellationToken.None);
        }

        public async Task SubscribeAsync(string topic)
        {
            if (!_mqttClient.IsConnected)
            {
                await ConnectAsync();
            }

            await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
                .WithTopic(topic)
                .WithExactlyOnceQoS()
                .Build());

            Console.WriteLine($"Berhasil berlangganan ke topik {topic}");
        }
    }
}
