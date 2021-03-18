import React from "react";
import { Text } from "theme-ui";
import { Decimal, StabilityDeposit, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { useLiquity } from "../../hooks/LiquityContext";
import { COIN, GT } from "../../strings";
import { Transaction } from "../Transaction";
import { ActionDescription } from "../ActionDescription";

type StabilityActionDescriptionProps = {
  originalDeposit: StabilityDeposit;
  editedLUSD: Decimal;
  changePending: boolean;
};

const select = ({
  trove,
  lusdBalance,
  frontend,
  ownFrontend,
  haveUndercollateralizedTroves
}: LiquityStoreState) => ({
  trove,
  lusdBalance,
  frontendRegistered: frontend.status === "registered",
  noOwnFrontend: ownFrontend.status === "unregistered",
  haveUndercollateralizedTroves
});

export const StabilityActionDescription: React.FC<StabilityActionDescriptionProps> = ({
  originalDeposit,
  editedLUSD
}) => {
  const {
    lusdBalance,
    frontendRegistered,
    noOwnFrontend,
    haveUndercollateralizedTroves
  } = useLiquitySelector(select);

  const {
    config,
    liquity: { send: liquity }
  } = useLiquity();

  const frontendTag = frontendRegistered ? config.frontendTag : undefined;

  const transactionId = "stability-deposit";

  const { depositLUSD, withdrawLUSD } = originalDeposit.whatChanged(editedLUSD) ?? {};

  const collateralGain = `${originalDeposit.collateralGain.prettify(4)} ETH`;
  const lqtyReward = `${originalDeposit.lqtyReward.prettify(4)} ${GT}`;
  const hasReward = originalDeposit.lqtyReward.nonZero;
  const hasGain = originalDeposit.collateralGain.nonZero;
  const hasRewardOrGain = hasGain || hasReward;
  const gains = hasReward ? `${collateralGain} and ${lqtyReward}` : collateralGain;
  const isDepositDirty = !!(depositLUSD || withdrawLUSD);

  if (!isDepositDirty) return null;

  return (
    <ActionDescription>
      {depositLUSD && (
        <Transaction
          id={transactionId}
          send={liquity.depositLUSDInStabilityPool.bind(liquity, depositLUSD, frontendTag)} // TODO we dont want these to be sendable
          requires={[
            [
              noOwnFrontend,
              "Your can't deposit using the same wallet address that registered this frontend" // TODO review this message for correctness
            ],
            [lusdBalance.gte(depositLUSD), `You don't have enough ${COIN}`]
          ]}
        >
          <Text>
            {hasRewardOrGain
              ? `You are depositing ${depositLUSD.prettify()} ${COIN} and claiming ${gains}`
              : `You are depositing ${depositLUSD.prettify()} ${COIN}`}
          </Text>
        </Transaction>
      )}
      {withdrawLUSD && (
        <Transaction
          id={transactionId}
          send={liquity.withdrawLUSDFromStabilityPool.bind(liquity, withdrawLUSD)}
          requires={[
            [
              !haveUndercollateralizedTroves,
              "You can't withdraw when there are undercollateralized Troves"
            ]
          ]}
        >
          <Text>
            {hasRewardOrGain
              ? `You are withdrawing ${withdrawLUSD.prettify()} ${COIN} and claiming ${gains}`
              : `You are withdrawing ${withdrawLUSD.prettify()} ${COIN}`}
          </Text>
        </Transaction>
      )}
    </ActionDescription>
  );
};