using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace backend.Services
{
    /// <summary>
    /// Handles exchanging Square OAuth codes for access tokens
    /// </summary>
    public class SquareOAuthService
    {
        private readonly string SQUARE_CLIENT_ID = "sandbox-sq0idb-uyB60fo26mwkhFhJag5Y-w";
        private readonly string SQUARE_CLIENT_SECRET = "sandbox-sq0csb-uAae_CVFCVYjjHFC1-H2RxRTqQKOhN87di_NwwJlWEo";

        /// <summary>
        /// Exchanges an OAuth authorization code for an access token and merchant ID
        /// </summary>
        public async Task<(string accessToken, string merchantId)> ExchangeSquareCodeAsync(string code)
        {
            var client = new HttpClient();

            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = SQUARE_CLIENT_ID,
                ["client_secret"] = SQUARE_CLIENT_SECRET,
                ["code"] = code,
                ["grant_type"] = "authorization_code"
            });

            var response = await client.PostAsync("https://connect.squareup.com/oauth2/token", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            dynamic? obj = JsonConvert.DeserializeObject(json);

            string? accessToken = obj?.access_token;
            string? merchantId = obj?.merchant_id;

            if (string.IsNullOrWhiteSpace(accessToken) || string.IsNullOrWhiteSpace(merchantId))
            {
                throw new InvalidOperationException("Square OAuth response did not return access_token or merchant_id.");
            }

            return (accessToken, merchantId);
        }
    }
}
