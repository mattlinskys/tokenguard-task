import axios, { type AxiosRequestConfig } from "axios";

import type { ITokenGuardTimelineResponse } from "../types/api";

export const getTimelineData = (
  chainName: string,
  compareWith: string,
  config?: AxiosRequestConfig
) =>
  axios.post<ITokenGuardTimelineResponse>(
    "https://api.tokenguard.io/db-api/growth-index/basic-timeline-data",
    {
      chainName,
      compareWith,
      period: "last year",
      metric: "tg_growth_index",
    },
    config
  );
