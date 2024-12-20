import { Button } from "@/components/ui/button";
import { useRemoveLiquidity } from "@/hooks/useRemoveLiquidity";
import { getTokensDetails } from "@/services/tokens/details";
import { Message } from "@/types/message";
import {
  RemoveLiquidityRequest,
  RemoveLiquidityResponse,
} from "@/types/removeLiquidity";
import { TokenInfo } from "@/types/token";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import AIThinkingState from "./AiThinking";
import TransactionStatusDetails from "./TransactionStatusDetails";
import { uniswapDetails } from "@/providers/uniswap/config/details";
import { aerodromeDetails } from "@/providers/aerodrome/config/details";

export default function RemoveTransactionDetails({
  message,
}: {
  message: Message;
}) {
  const [isLoading, setIsLoadinng] = useState(true);
  const [txnData, setTxnData] = useState<Omit<
    RemoveLiquidityResponse,
    "zapData"
  > | null>(null);

  useEffect(() => {
    const fetchTxnData = async () => {
      try {
        setIsLoadinng(true);
        if (data.zapOutToken && data.zapOutAmount) {
          const tokensDetails = await getTokensDetails(
            [data.zapOutToken],
            data.chainId
          );
          const zapInTokenDetails = tokensDetails as TokenInfo;
          const response = await buildRemoveLiquidity({
            poolAddress: data.poolAddress,
            provider: data.provider.toLowerCase(),
            zapOutToken: {
              address: data.zapOutToken,
              amount: BigInt(data.zapOutAmount),
              decimals: zapInTokenDetails.decimals,
            },
            nftId: BigInt(data.nftId),
          });
          setTxnData(response);
        } else {
          const response = await buildRemoveLiquidity({
            poolAddress: data.poolAddress,
            provider: data.provider.toLowerCase(),
            nftId: BigInt(data.nftId),
          });
          setTxnData(response);
        }
      } catch (error) {
        console.error("Error while adding liquidity", error);
      } finally {
        setIsLoadinng(false);
      }
    };
    fetchTxnData();
  }, []);

  const { buildRemoveLiquidity, sendRemoveLiquidityTxn, txnStatus, txnHash } =
    useRemoveLiquidity();

  const data = message.content as RemoveLiquidityRequest;

  if (isLoading && !txnData) {
    return <AIThinkingState />;
  }

  if (!txnData) {
    return (
      <div className="bg-gray-40 border-thin w-full max-w-lg border-gray-20 text-white rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-medium">Transaction Details</h2>
        <p className="text-sm text-zinc-400">
          Failed to fetch transaction details
        </p>
      </div>
    );
  }
  const { poolSymbol, provider, token0, token1, zapOutToken } = txnData.details;

  return (
    <div className="bg-gray-40 border-thin max-w-lg w-full border-gray-20 text-white rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-medium">Transaction Details</h2>

      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Pool Details:</p>
        <div className="flex gap-2">
          {[token0, token1].map((token, index) => (
            <div key={index} className="flex-1 bg-zinc-800/50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-30 flex items-center justify-center">
                    <img
                      src={token.logo}
                      alt={`${token.symbol} icon`}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <span>{token.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {Number(
                      formatUnits(BigInt(token.amount), token.decimals)
                    ).toFixed(5)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ≈ ${token.amountUsd.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {zapOutToken && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">Zap Out:</p>
          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">T</span>
              </div>

              <div>
                <p className="font-medium">{zapOutToken.symbol}</p>
                <p className="text-xs text-zinc-400">{zapOutToken.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {Number(
                  formatUnits(BigInt(zapOutToken.amount), zapOutToken.decimals)
                ).toFixed(5)}
              </p>
              <p className="text-xs text-zinc-400">
                ≈ ${zapOutToken.amountUsd.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Slippage</span>
          <span>{0.5}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Protocol</span>
          <div className="flex items-center gap-2">
            {provider.toLowerCase() === uniswapDetails.id ? (
              <img
                src={uniswapDetails.logo}
                width={16}
                height={16}
                className="rounded-full"
              />
            ) : (
              <img
                src={aerodromeDetails.logo}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}{" "}
            <span>{provider}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Pool</span>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-zinc-800 px-2 py-1 rounded">
              {poolSymbol}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-zinc-400">APY</span>
          <span>{"20%"}</span>
        </div>
      </div>

      {txnStatus && (
        <TransactionStatusDetails status={txnStatus} txnHash={txnHash!} />
      )}

      <Button
        className="w-full rounded-full bg-gradient-to-r range-button-active text-white py-6"
        onClick={() => {
          if (txnData) {
            sendRemoveLiquidityTxn({
              data: txnData.callData,
              to: txnData.to,
              value: BigInt(txnData.value),
              nftId: BigInt(data.nftId),
              nftManager: txnData.details.nftManagerAddress,
            });
          }
        }}
        disabled={Boolean(txnStatus)}
      >
        Confirm
      </Button>
    </div>
  );
}
