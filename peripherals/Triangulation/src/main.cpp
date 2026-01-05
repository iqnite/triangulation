#include <Arduino.h>
#include <ArduinoJson.h>

#ifdef ESP8266
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#else
#include <WiFi.h>
#include <HTTPClient.h>
#endif

#include "secrets.h"

typedef struct
{
  String ssid;
  int rssi;
} NetworkInfo;
int getNetworks(NetworkInfo *networks);
void printNetworkInfo(NetworkInfo *networks, int networkCount);
int sendNetworkInfoToServer(NetworkInfo *networks, int networkCount, String serverUrl);

void setup()
{
  Serial.begin(9600);
  WiFi.mode(WIFI_STA);
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  WiFi.setAutoReconnect(true);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected. MAC: " + WiFi.macAddress());
  delay(100);
}

void loop()
{
  NetworkInfo *networks = new NetworkInfo[50];
  int networkCount = getNetworks(networks);
  printNetworkInfo(networks, networkCount);
  sendNetworkInfoToServer(networks, networkCount, SERVER_URL);
  delete[] networks;
  delay(5000);
}

int getNetworks(NetworkInfo *networks)
{
  int networkCount = WiFi.scanNetworks();
  for (int i = 0; i < networkCount; i++)
  {
    networks[i].ssid = WiFi.SSID(i);
    networks[i].rssi = WiFi.RSSI(i);
  }
  return networkCount;
}

void printNetworkInfo(NetworkInfo *networks, int networkCount)
{
  Serial.println("Network \t RSSI");
  for (int i = 0; i < networkCount; i++)
  {
    Serial.print(networks[i].ssid);
    Serial.print(" \t ");
    Serial.println(networks[i].rssi);
  }
}

int sendNetworkInfoToServer(NetworkInfo *networks, int networkCount, String serverUrl)
{
  if (serverUrl == "")
  {
    Serial.println("Server URL not defined.");
    return -1;
  }
  if (!WiFi.isConnected())
  {
    Serial.println("WiFi not connected.");
    return -1;
  }
  String jsonPayload;
  JsonDocument doc;
  doc["device"] = WiFi.macAddress();
  JsonArray networksArray = doc["networks"].to<JsonArray>();
  for (int i = 0; i < networkCount; i++)
  {
    JsonObject networkObj = networksArray.add<JsonObject>();
    networkObj["ssid"] = networks[i].ssid;
    networkObj["rssi"] = networks[i].rssi;
  }
  serializeJson(doc, jsonPayload);
  Serial.println("Sending payload: " + jsonPayload);
  HTTPClient http;
  WiFiClient client;
  client.setTimeout(15000);
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0)
  {
    String response = http.getString();
    Serial.println("Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  }
  else
  {
    Serial.println("Error on sending POST: " + String(httpResponseCode));
  }
  http.end();
  return httpResponseCode;
}
