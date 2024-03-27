import { FC, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";

import { SUPPORTED_CHAINS } from "./constants/chains";
import { getTimelineData } from "./api/tokenguard";
import type { TSupportedChain } from "./types/chains";
import type { ITokenGuardTimelineResponse } from "./types/api";

const App: FC = () => {
  const [granularity, setGranularity] = useState(1);
  const [chainFrom, setChainFrom] = useState<TSupportedChain>("ethereum");
  const [chainTo, setChainTo] = useState<TSupportedChain>("solana");
  const [data, setData] = useState<ITokenGuardTimelineResponse | null>(null);
  const timeline = useMemo(
    () =>
      data
        ? {
            cumulative: {
              tg_growth_index: data.cumulative.tg_growth_index.filter(
                (_, i) => i % granularity === 0
              ),
            },
            blockchain: {
              tg_growth_index: data.blockchain.tg_growth_index.filter(
                (_, i) => i % granularity === 0
              ),
            },
          }
        : null,
    [data, granularity]
  );

  useEffect(() => {
    // Ignore data fetch when same chains are selected
    if (chainFrom === chainTo) {
      return;
    }

    setData(null);
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await getTimelineData(chainFrom, chainTo, {
          signal: controller.signal,
        });

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [chainFrom, chainTo]);

  return (
    <Box maxWidth={1024} p={4}>
      <Stack maxWidth={768} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="granularity">Granularity</InputLabel>
          <Select
            labelId="granularity"
            id="granularity"
            value={granularity}
            label="Granularity"
            onChange={(e) => setGranularity(e.target.value as number)}
          >
            {[1, 2, 4].map((value) => (
              <MenuItem key={value} value={value}>
                {value} Week(s)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <Autocomplete
              disablePortal
              id="chain-from"
              options={SUPPORTED_CHAINS}
              value={chainFrom}
              onChange={(_, value) => setChainFrom(value!)}
              renderInput={(params) => (
                <TextField {...params} label="From chain" />
              )}
            />
          </FormControl>

          <FormControl fullWidth>
            <Autocomplete
              disablePortal
              id="chain-to"
              options={SUPPORTED_CHAINS}
              value={chainTo}
              onChange={(_, value) => setChainTo(value!)}
              renderInput={(params) => (
                <TextField {...params} label="To chain" />
              )}
            />
          </FormControl>
        </Stack>
      </Stack>

      <Box py={4}>
        <Divider />
      </Box>

      {timeline ? (
        <>
          <LineChart
            xAxis={[
              {
                data: timeline.blockchain.tg_growth_index.map(({ date }) =>
                  new Date(date).getTime()
                ),
                valueFormatter: (value: number) =>
                  new Date(value).toISOString().split("T")[0],
              },
            ]}
            series={[
              {
                data: timeline.blockchain.tg_growth_index.map(
                  ({ value }) => value
                ),
                label: "Blockchain",
                curve: "linear",
              },
              {
                data: timeline.cumulative.tg_growth_index.map(
                  ({ value }) => value
                ),
                label: "Cumulative",
                curve: "linear",
              },
            ]}
            height={400}
            margin={{ left: 24, right: 24, top: 24, bottom: 24 }}
            grid={{ vertical: true, horizontal: true }}
          />
        </>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};

export default App;
