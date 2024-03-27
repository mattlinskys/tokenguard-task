export interface ITokenGuardTimelineResponse {
  blockchain: {
    tg_growth_index: {
      date: string;
      value: number;
    }[];
  };
  cumulative: {
    tg_growth_index: {
      date: string;
      value: number;
    }[];
  };
}
