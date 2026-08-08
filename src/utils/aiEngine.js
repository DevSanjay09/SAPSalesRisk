/**
 * aiEngine.js
 * Decision Support Engine — NOT a chatbot.
 *
 * For a given enriched order, it:
 *   1. Ranks the causes of risk by weighted contribution
 *   2. Recommends the best action
 *   3. Estimates score after applying the recommendation
 */

const FACTOR_WEIGHTS = {
  stock:   50,
  credit:  30,
  urgency: 20,
};

/**
 * @param {object} enrichedOrder
 * @param {object} recommendation - from recommendationEngine
 * @returns AI decision support object
 */
export const analyzeOrder = (enrichedOrder, recommendation) => {
  const { riskScore, riskFactors } = enrichedOrder;

  if (riskScore === 0) {
    return {
      causesRanked: [],
      bestAction: 'No Action Required',
      estimatedScore: 0,
      estimatedDelayReduction: 0,
      delayProbabilityBefore: 5,
      delayProbabilityAfter: 5,
      actionEffectiveness: 'none',
    };
  }

  // 1. Rank causes by % contribution
  const total = riskFactors.reduce((sum, f) => sum + f.points, 0);
  const causesRanked = riskFactors
    .map((f) => ({
      cause: f.label,
      type: f.type,
      points: f.points,
      percentage: total > 0 ? Math.round((f.points / total) * 100) : 0,
      detail: f.detail,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // 2. Best action
  const bestAction = recommendation?.primary?.action || 'Review Manually';

  // 3. Estimate score improvement per action
  // Logic: applying the recommended action reduces the dominant factor's points
  const dominantFactor = causesRanked[0]?.type;
  let scoreReduction = 0;
  let delayDayReduction = 0;

  const factorReductions = {
    stock:   { scoreReduction: 40, delayDays: 2 },  // expedite reduces most of stock risk
    credit:  { scoreReduction: 25, delayDays: 1 },  // finance approval reduces credit risk
    urgency: { scoreReduction: 15, delayDays: 1 },  // prioritize picking reduces urgency risk
  };

  if (dominantFactor && factorReductions[dominantFactor]) {
    scoreReduction = factorReductions[dominantFactor].scoreReduction;
    delayDayReduction = factorReductions[dominantFactor].delayDays;
  }

  // If multiple factors, partial reductions for secondary
  if (causesRanked.length > 1) {
    const secondaryFactor = causesRanked[1]?.type;
    if (secondaryFactor && factorReductions[secondaryFactor]) {
      scoreReduction += Math.round(factorReductions[secondaryFactor].scoreReduction * 0.3);
    }
  }

  const estimatedScore = Math.max(0, riskScore - scoreReduction);

  // 4. Delay probability (heuristic based on score)
  const delayProbabilityBefore = Math.min(98, Math.round(riskScore * 0.9 + 5));
  const delayProbabilityAfter  = Math.min(95, Math.max(5, Math.round(estimatedScore * 0.6 + 5)));

  const effectiveness =
    scoreReduction >= 40 ? 'high' :
    scoreReduction >= 20 ? 'medium' : 'low';

  return {
    causesRanked,
    bestAction,
    estimatedScore,
    estimatedDelayReduction: delayDayReduction,
    delayProbabilityBefore,
    delayProbabilityAfter,
    actionEffectiveness: effectiveness,
  };
};
