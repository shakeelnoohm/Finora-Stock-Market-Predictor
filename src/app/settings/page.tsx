"use client";

import { useState, useEffect } from "react";
import { Save, Key, Brain, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("alpha_vantage_key") ?? "";
    setApiKey(key);
  }, []);

  function saveKey() {
    localStorage.setItem("alpha_vantage_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearWatchlist() {
    localStorage.removeItem("watchlist");
    alert("Watchlist cleared.");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure Finora</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <Key className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alpha Vantage API Key
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your API key…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={saveKey}>
                <Save className="h-4 w-4" />
                {saved ? "Saved!" : "Save"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Get a free key at{" "}
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                alphavantage.co
              </a>
              . Without a key, realistic mock data for NSE-listed stocks is used. For live NSE/BSE data, consider integrating with{" "}
              <a href="https://nseindia.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">NSE India API</a>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Model</CardTitle>
          <Brain className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Model</span>
            <span className="text-sm font-mono text-indigo-500">LSTM (TensorFlow.js)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Window Size</span>
            <span className="text-sm font-mono">20 days</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Training Epochs</span>
            <span className="text-sm font-mono">15</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Prediction Horizon</span>
            <span className="text-sm font-mono">7 days</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Execution</span>
            <span className="text-sm font-mono text-emerald-500">In-browser (WebGL)</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            The LSTM model trains locally in your browser — no data leaves your device.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <Trash2 className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Clear Watchlist</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Remove all saved stocks from your watchlist</p>
            </div>
            <Button variant="destructive" size="sm" onClick={clearWatchlist}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
