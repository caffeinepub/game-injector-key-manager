import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Globe, Code2, FileJson, Terminal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ApiDocsSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Get the canister ID from the current origin
  const canisterId = window.location.hostname.split('.')[0];
  const apiEndpoint = `https://${canisterId}.icp0.io/api/verifyLoginWithInjector`;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const javaExample = `// Add this to your injector's LoginActivity.java
import org.json.JSONObject;
import okhttp3.*;

public class InjectorLogin {
    private static final String API_URL = "${apiEndpoint}";
    // Use the numeric Injector ID from the Injectors tab
    private static final String INJECTOR_ID = "1"; // Replace with your injector's ID
    private final OkHttpClient client = new OkHttpClient();
    
    public void verifyKey(String key, String deviceId) {
        JSONObject json = new JSONObject();
        try {
            json.put("key", key);
            json.put("deviceId", deviceId);
            json.put("injectorId", INJECTOR_ID); // Must match the assigned injector
            
            RequestBody body = RequestBody.create(
                json.toString(),
                MediaType.parse("application/json")
            );
            
            Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .build();
            
            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onResponse(Call call, Response response) {
                    try {
                        String responseBody = response.body().string();
                        JSONObject result = new JSONObject(responseBody);
                        
                        if (result.getString("status").equals("success")) {
                            // Key is valid - proceed with injection
                            runOnUiThread(() -> startInjection());
                        } else {
                            // Show error message
                            String message = result.getString("message");
                            runOnUiThread(() -> showError(message));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                
                @Override
                public void onFailure(Call call, IOException e) {
                    runOnUiThread(() -> showError("Connection failed"));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;

  const kotlinExample = `// Kotlin version for modern Android injectors
import org.json.JSONObject
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

class InjectorLogin {
    private val client = OkHttpClient()
    private val apiUrl = "${apiEndpoint}"
    // Use the numeric Injector ID from the Injectors tab
    private val injectorId = "1" // Replace with your injector's ID
    
    fun verifyKey(key: String, deviceId: String) {
        val json = JSONObject().apply {
            put("key", key)
            put("deviceId", deviceId)
            put("injectorId", injectorId) // Must match the assigned injector
        }
        
        val body = json.toString()
            .toRequestBody("application/json".toMediaType())
        
        val request = Request.Builder()
            .url(apiUrl)
            .post(body)
            .build()
        
        client.newCall(request).enqueue(object : Callback {
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    val result = JSONObject(responseBody)
                    
                    when (result.getString("status")) {
                        "success" -> {
                            // Key is valid - proceed with injection
                            runOnUiThread { startInjection() }
                        }
                        else -> {
                            // Show error message
                            val message = result.getString("message")
                            runOnUiThread { showError(message) }
                        }
                    }
                }
            }
            
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread { showError("Connection failed") }
            }
        })
    }
}`;

  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "GAURAV-AB12E",
    "deviceId": "device-unique-id-123",
    "injectorId": "1"
  }'`;

  const requestExample = `{
  "key": "GAURAV-AB12E",
  "deviceId": "device-unique-id-123",
  "injectorId": "1"
}`;

  const successResponse = `{
  "status": "success",
  "message": "Key is valid",
  "valid": true
}`;

  const errorResponse = `{
  "status": "error",
  "message": "Key has expired",
  "valid": false
}`;

  const errorMessages = [
    { error: "Key not found", description: "The provided key doesn't exist in the system" },
    { error: "Key has expired", description: "The key's duration has passed" },
    { error: "Key is blocked", description: "Admin has blocked this key" },
    { error: "Device limit reached", description: "Maximum number of devices have used this key" },
    { error: "This key is not valid for [InjectorName]", description: "The key is assigned to a specific injector and cannot be used with a different one" },
    { error: "Missing required fields", description: "Request is missing key, deviceId, or injectorId" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">API Documentation</h2>
        <p className="text-muted-foreground">
          Integrate your injector apps with our authentication system
        </p>
      </div>

      {/* Endpoint Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Endpoint URL</CardTitle>
          </div>
          <CardDescription>
            Use this endpoint to verify login keys from your injector apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">POST</Badge>
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
              {apiEndpoint}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(apiEndpoint, 0)}
            >
              {copiedIndex === 0 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            All requests must use POST method with JSON content type
          </p>
        </CardContent>
      </Card>

      {/* Request Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="h-5 w-5 text-primary" />
            <CardTitle>Request Format</CardTitle>
          </div>
          <CardDescription>
            Send a JSON object with the following fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{requestExample}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(requestExample, 1)}
            >
              {copiedIndex === 1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-semibold text-sm mb-1">key</h4>
              <p className="text-sm text-muted-foreground">
                The login key entered by the user (required)
              </p>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-semibold text-sm mb-1">deviceId</h4>
              <p className="text-sm text-muted-foreground">
                Unique device identifier - use Android ID or custom UUID (required)
              </p>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <h4 className="font-semibold text-sm mb-1">injectorId</h4>
              <p className="text-sm text-muted-foreground">
                Your injector's numeric ID from the Injectors tab (required). Keys must be assigned to this injector — wrong injector ID will be rejected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-primary" />
            <CardTitle>Response Format</CardTitle>
          </div>
          <CardDescription>
            The API returns a JSON response with validation status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="default">Success</Badge>
              Key is valid and can be used
            </h4>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{successResponse}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(successResponse, 2)}
              >
                {copiedIndex === 2 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="destructive">Error</Badge>
              Key validation failed
            </h4>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{errorResponse}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(errorResponse, 3)}
              >
                {copiedIndex === 3 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Possible Error Messages</CardTitle>
          <CardDescription>
            Handle these error cases in your injector app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {errorMessages.map((item) => (
              <div key={item.error} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                  {item.error}
                </Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Java Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Java Implementation</CardTitle>
          </div>
          <CardDescription>
            Add this code to your Android injector (Java)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
              <code className="language-java">{javaExample}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(javaExample, 4)}
            >
              {copiedIndex === 4 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kotlin Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Kotlin Implementation</CardTitle>
          </div>
          <CardDescription>
            Modern Kotlin version for Android injectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
              <code className="language-kotlin">{kotlinExample}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(kotlinExample, 5)}
            >
              {copiedIndex === 5 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* cURL Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>cURL Example</CardTitle>
          </div>
          <CardDescription>
            Test the API endpoint from command line
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{curlExample}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(curlExample, 6)}
            >
              {copiedIndex === 6 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies Note */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Required Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Add these to your Android project's <code className="bg-muted px-2 py-0.5 rounded">build.gradle</code>:</p>
          <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
            <code>{`dependencies {
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'org.json:json:20230227'
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
