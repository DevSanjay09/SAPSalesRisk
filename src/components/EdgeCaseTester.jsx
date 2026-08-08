import React, { useState } from 'react';
import { EDGE_CASE_SCENARIOS } from '../utils/edgeCaseDatasets';
import { validateAll } from '../utils/validationEngine';
import { calculateRisk, buildInventoryMap, buildCreditMap } from '../utils/riskEngine';
import { sortByPriority } from '../utils/priorityEngine';
import { TbFlask, TbCircleCheck, TbCircleX, TbPlayerPlay, TbInfoCircle } from 'react-icons/tb';

/**
 * EdgeCaseTester
 * Provides quick buttons for testing common edge cases & data anomalies.
 * Evaluates the dataset and renders a clear PASS / FAIL result card.
 */
export default function EdgeCaseTester({ onRunEdgeCase }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectScenario = async (scenario) => {
    setActiveScenario(scenario);
    setLoading(true);

    try {
      // 1. Run through validation engine
      const validation = await validateAll(scenario.dataset);

      // 2. Build lookup maps & compute risk for valid orders
      const inventoryMap = buildInventoryMap(validation.validInventory);
      const creditMap = buildCreditMap(validation.validCredit);
      const enrichedOrders = validation.validOrders.map((order) =>
        calculateRisk(order, inventoryMap, creditMap)
      );
      const sortedOrders = sortByPriority(enrichedOrders);

      // 3. Evaluate pass/fail condition
      const passed = scenario.check(sortedOrders, validation.issues);

      const result = {
        scenario,
        validation,
        orders: sortedOrders,
        passed,
      };

      setTestResult(result);

      // 4. Pass back to parent dashboard to update view if desired
      if (onRunEdgeCase) {
        onRunEdgeCase(sortedOrders, validation, scenario);
      }
    } catch (err) {
      setTestResult({
        scenario,
        error: err.message,
        passed: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <TbFlask className="text-brand-600 text-lg" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Edge Case Testing</p>
          <p className="text-xs text-slate-400">
            Quickly test common edge cases and data anomalies in memory without changing CSV files.
          </p>
        </div>
      </div>

      {/* Scenario Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EDGE_CASE_SCENARIOS.map((sc) => {
          const isActive = activeScenario?.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              disabled={loading}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300'
              }`}
            >
              <span>{sc.icon}</span>
              <span>{sc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Test Result Card */}
      {testResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 panel-slide-in">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-base">{testResult.scenario.icon}</span>
              <span className="text-sm font-bold text-slate-800">
                Scenario: {testResult.scenario.label}
              </span>
            </div>
            {testResult.passed ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                <TbCircleCheck className="text-sm" /> PASS
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                <TbCircleX className="text-sm" /> FAIL
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Scenario Description</p>
              <p className="text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5">
                {testResult.scenario.description}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Outcome</p>
              <p className="text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 font-medium">
                {testResult.scenario.expectedLabel}
              </p>
            </div>
          </div>

          {testResult.validation && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Processed {testResult.validation.validOrders.length} valid order(s), found{' '}
                {testResult.validation.issues.length} validation issue(s).
              </span>
              <span className="text-brand-600 font-medium">
                Dashboard updated with test data
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
