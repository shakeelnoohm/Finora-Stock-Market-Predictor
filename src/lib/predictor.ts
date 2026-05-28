"use client";

import * as tf from "@tensorflow/tfjs";
import { PredictionPoint, PredictionResult, StockDataPoint } from "./types";
import { format, addDays } from "date-fns";

const WINDOW_SIZE = 20;
const PREDICTION_DAYS = 7;

function normalize(data: number[]): { normalized: number[]; min: number; max: number } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return { normalized: data.map((v) => (v - min) / range), min, max };
}

function denormalize(value: number, min: number, max: number): number {
  return value * (max - min) + min;
}

function createSequences(data: number[], windowSize: number): [number[][], number[]] {
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = windowSize; i < data.length; i++) {
    X.push(data.slice(i - windowSize, i));
    y.push(data[i]);
  }
  return [X, y];
}

export async function runPrediction(
  symbol: string,
  historicalData: StockDataPoint[]
): Promise<PredictionResult> {
  const closes = historicalData.map((d) => d.close);
  const currentPrice = closes[closes.length - 1];

  const { normalized, min, max } = normalize(closes);
  const [X, y] = createSequences(normalized, WINDOW_SIZE);

  if (X.length < 5) {
    throw new Error("Not enough data to train the model.");
  }

  const xTensor = tf.tensor3d(
    X.map((seq) => seq.map((v) => [v])),
    [X.length, WINDOW_SIZE, 1]
  );
  const yTensor = tf.tensor2d(y, [y.length, 1]);

  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: 32,
      inputShape: [WINDOW_SIZE, 1],
      returnSequences: false,
    })
  );
  model.add(tf.layers.dropout({ rate: 0.1 }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ optimizer: tf.train.adam(0.01), loss: "meanSquaredError" });

  await model.fit(xTensor, yTensor, {
    epochs: 15,
    batchSize: 16,
    verbose: 0,
    validationSplit: 0.1,
  });

  const lastHistory = model.history?.history;
  const finalLoss = lastHistory?.loss?.[lastHistory.loss.length - 1] as number ?? 0.05;
  const modelAccuracy = Math.max(0, Math.min(100, (1 - Math.sqrt(finalLoss)) * 100));

  const predictions: PredictionPoint[] = [];
  let currentWindow = normalized.slice(-WINDOW_SIZE);

  for (let i = 1; i <= PREDICTION_DAYS; i++) {
    const inputTensor = tf.tensor3d([currentWindow.map((v) => [v])], [1, WINDOW_SIZE, 1]);
    const predTensor = model.predict(inputTensor) as tf.Tensor;
    const predValue = (await predTensor.data())[0];
    const predicted = denormalize(predValue, min, max);
    const volatility = predicted * 0.015 * (1 + i * 0.1);

    predictions.push({
      date: format(addDays(new Date(), i), "yyyy-MM-dd"),
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.round((predicted - volatility) * 100) / 100,
      upper: Math.round((predicted + volatility) * 100) / 100,
    });

    currentWindow = [...currentWindow.slice(1), predValue];
    inputTensor.dispose();
    predTensor.dispose();
  }

  xTensor.dispose();
  yTensor.dispose();
  model.dispose();

  const lastPred = predictions[predictions.length - 1].predicted;
  const priceDiff = lastPred - currentPrice;
  const trend =
    priceDiff > currentPrice * 0.01
      ? "bullish"
      : priceDiff < -currentPrice * 0.01
      ? "bearish"
      : "neutral";

  const changePercent = ((lastPred - currentPrice) / currentPrice) * 100;
  const summary =
    trend === "bullish"
      ? `Model predicts a ${changePercent.toFixed(2)}% rise over 7 days. Bullish momentum detected.`
      : trend === "bearish"
      ? `Model predicts a ${Math.abs(changePercent).toFixed(2)}% decline over 7 days. Caution advised.`
      : `Model predicts relatively stable prices over 7 days. Low volatility expected.`;

  return {
    symbol,
    currentPrice,
    predictions,
    confidence: Math.round(modelAccuracy * 10) / 10,
    trend,
    summary,
    modelAccuracy: Math.round(modelAccuracy * 10) / 10,
  };
}
