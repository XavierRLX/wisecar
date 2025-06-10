// lib/useDeeplab.ts
import { useState, useEffect } from "react";
import * as deeplab from "@tensorflow-models/deeplab";
import "@tensorflow/tfjs";

export function useDeeplab() {
  const [model, setModel] = useState<deeplab.SemanticSegmentation | null>(null);

  useEffect(() => {
    deeplab
      .load({ base: "pascal", quantizationBytes: 2 })
      .then((m) => setModel(m))
      .catch(console.error);
  }, []);

  return model;
}
