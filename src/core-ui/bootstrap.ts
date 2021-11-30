import dva, { DvaInstance, Model } from "dva";

type dvaInstance = DvaInstance & { replaceModel(model: Model): void };

export const app: dvaInstance = dva() as any;
