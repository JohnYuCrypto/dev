import { Decimal } from "@liquity/decimal";

import { Trove, TroveWithPendingRewards } from "./Trove";
import { StabilityDeposit } from "./StabilityDeposit";

export interface ReadableLiquity {
  getTotalRedistributed(): Promise<Trove>;

  getTroveWithoutRewards(address?: string): Promise<TroveWithPendingRewards>;

  getTrove(address?: string): Promise<Trove>;

  getNumberOfTroves(): Promise<number>;

  getPrice(): Promise<Decimal>;

  getTotal(): Promise<Trove>;

  getStabilityDeposit(address?: string): Promise<StabilityDeposit>;

  getQuiInStabilityPool(): Promise<Decimal>;

  getQuiBalance(address?: string): Promise<Decimal>;

  getLastTroves(
    startIdx: number,
    numberOfTroves: number
  ): Promise<(readonly [string, TroveWithPendingRewards])[]>;

  getFirstTroves(
    startIdx: number,
    numberOfTroves: number
  ): Promise<(readonly [string, TroveWithPendingRewards])[]>;
}