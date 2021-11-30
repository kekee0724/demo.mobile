import React from "react";
import { createLoadLazyModule } from "@reco-m/core";

import { Loading } from "./loading";

export const loadLazyModule = createLoadLazyModule(<Loading.Component /> as React.ReactNode);
