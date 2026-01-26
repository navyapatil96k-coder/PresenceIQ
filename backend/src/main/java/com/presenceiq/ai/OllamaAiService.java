package com.presenceiq.ai;

import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

@Service
public class OllamaAiService {

    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL = "llama3.2:3b";

    public String ask(String prompt) {
        try {
            URL url = new URL(OLLAMA_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // ✅ Add randomness so answers change
            String nonce = UUID.randomUUID().toString();

            String jsonBody = """
                    {
                      "model": "%s",
                      "prompt": "%s",
                      "stream": false,
                      "options": {
                        "temperature": 0.9,
                        "top_p": 0.9
                      }
                    }
                    """.formatted(MODEL, escapeJson(prompt + "\n\nNonce:" + nonce));

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes());
            }

            int code = conn.getResponseCode();

            InputStream is = (code >= 200 && code < 300)
                    ? conn.getInputStream()
                    : conn.getErrorStream();

            String resp = readAll(is);

            if (code < 200 || code >= 300) {
                return "Ollama error: " + code + " -> " + resp;
            }

            String extracted = extractField(resp, "response");
            return extracted != null ? extracted.trim() : resp;

        } catch (Exception e) {
            return "Ollama error: " + e.getMessage();
        }
    }

    private static String readAll(InputStream is) throws IOException {
        if (is == null) return "";
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        return sb.toString();
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private static String extractField(String json, String field) {
        String key = "\"" + field + "\":";
        int idx = json.indexOf(key);
        if (idx == -1) return null;
        int start = json.indexOf("\"", idx + key.length());
        int end = json.indexOf("\"", start + 1);
        if (start == -1 || end == -1) return null;
        return json.substring(start + 1, end);
    }
}
