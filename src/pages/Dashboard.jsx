import React, { useState, useEffect, useCallback } from 'react';
import { TbAlertOctagon, TbCircleCheck, TbInfoCircle } from 'react-icons/tb';

import Header from '../components/Header';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import PriorityQueue from '../components/PriorityQueue';
import OrderTable from '../components/OrderTable';
import OrderDetails from '../components/OrderDetails';
import RecommendationPanel from '../components/RecommendationPanel';
import BeforeAfterPanel from '../components/BeforeAfterPanel';

import DataSourceSelector from '../components/DataSourceSelector';
import UploadPanel from '../components/UploadPanel';
import ValidationSummary from '../components/ValidationSummary';
import IssuesPanel from '../components/IssuesPanel';
import EdgeCaseTester from '../components/EdgeCaseTester';
import NetworkStatusModal from '../components/NetworkStatusModal';

import { loadOrdersCSV, loadInventoryCSV, loadCreditCSV } from '../utils/csvLoader';
import { validateOrders, validateInventory, validateCredit } from '../utils/validations';
import { calculateRisk, buildInventoryMap, buildCreditMap } from '../utils/riskEngine';
import { sortByPriority } from '../utils/priorityEngine';
import { getRecommendations } from '../utils/recommendationEngine';
import { analyzeOrder } from '../utils/aiEngine';
import { validateAll } from '../utils/validationEngine';

/* ─── Error Banner ──────────────────────────────────────────────── */
const ValidationBanner = ({ errors }) => (
  <div className="max-w-screen-2xl mx-auto px-6 py-4">
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <TbAlertOctagon className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-700 mb-2">Invalid CSV Structure</p>
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-600 flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">•</span> {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Summary Banner ─────────────────────────────────────────────── */
const SummaryBanner = () => (
  <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
    <div className="max-w-screen-2xl mx-auto px-6 py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200 mb-1">Business Problem</p>
          <p className="text-sm text-blue-100 leading-relaxed">
            Manual review of every order causes delays, missed deliveries, and inefficient prioritization.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200 mb-1">Our Solution</p>
          <p className="text-sm text-blue-100 leading-relaxed">
            Automatically identify high-risk orders, prioritize them, explain root causes, and recommend corrective actions.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200 mb-2">Business Benefits</p>
          <ul className="space-y-1">
            {[
              'Reduced manual effort',
              'Faster order fulfillment',
              'Improved on-time delivery',
              'Better inventory utilization',
              'Reduced credit-related delays',
            ].map((b) => (
              <li key={b} className="text-xs text-blue-100 flex items-center gap-1.5">
                <TbCircleCheck className="text-green-400 flex-shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Loading Skeleton ───────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-lg ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
    <Skeleton className="h-80" />
  </div>
);

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [state, setState] = useState({
    loading: true,
    errors: [],
    orders: [],        // enriched + sorted
    rawOrders: [],
    selectedOrder: null,
    aiAnalysis: null,
    recommendations: null,
    lastRefresh: null,
  });

  // Data mode: 'demo' | 'upload' | 'edge'
  const [dataMode, setDataMode] = useState('demo');

  // Upload & validation state
  const [validationResult, setValidationResult] = useState(null);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  /* ── Load Demo CSV Data ────────────────────────────────────────── */
  const loadDemoData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, errors: [] }));
    setValidationResult(null);

    try {
      const [rawOrders, rawInventory, rawCredit] = await Promise.all([
        loadOrdersCSV(),
        loadInventoryCSV(),
        loadCreditCSV(),
      ]);

      // Validate demo data
      const vOrders = validateOrders(rawOrders);
      const vInventory = validateInventory(rawInventory);
      const vCredit = validateCredit(rawCredit);

      const allErrors = [...vOrders.errors, ...vInventory.errors, ...vCredit.errors];
      if (allErrors.length > 0) {
        setState((prev) => ({ ...prev, loading: false, errors: allErrors }));
        return;
      }

      // Build lookup maps
      const inventoryMap = buildInventoryMap(rawInventory);
      const creditMap = buildCreditMap(rawCredit);

      // Enrich orders
      const enriched = rawOrders.map((order) => calculateRisk(order, inventoryMap, creditMap));

      // Sort by priority
      const sorted = sortByPriority(enriched);

      setState((prev) => ({
        ...prev,
        loading: false,
        errors: [],
        orders: sorted,
        rawOrders: rawOrders,
        selectedOrder: null,
        aiAnalysis: null,
        recommendations: null,
        lastRefresh: Date.now(),
      }));
    } catch (err) {
      console.warn('Demo CSV load error:', err);
      setIsNetworkModalOpen(true);
      setState((prev) => ({
        ...prev,
        loading: false,
        errors: [],
      }));
    }
  }, []);

  useEffect(() => {
    if (dataMode === 'demo') {
      loadDemoData();
    }
  }, [dataMode, loadDemoData]);

  /* ── Handle Custom CSV Upload & Validation ─────────────────────── */
  const handleValidateUploadedFiles = async (files) => {
    // Strict upload isolation: ONLY use uploaded files or empty arrays. NEVER fall back to demoCache!
    const sources = {
      orders: files.orders || null,
      inventory: files.inventory || null,
      credit: files.credit || null,
    };

    const options = {
      hasUploadedOrders: !!files.orders,
      hasUploadedInventory: !!files.inventory,
      hasUploadedCredit: !!files.credit,
    };

    const valResult = await validateAll(sources, options);
    setValidationResult(valResult);
  };

  /* ── Process Valid Records from Validation ────────────────────── */
  const handleProcessValidRecords = () => {
    if (!validationResult) return;

    const { validOrders, validInventory, validCredit } = validationResult;
    const inventoryMap = buildInventoryMap(validInventory);
    const creditMap = buildCreditMap(validCredit);

    const enriched = validOrders.map((order) => calculateRisk(order, inventoryMap, creditMap));
    const sorted = sortByPriority(enriched);

    setState((prev) => ({
      ...prev,
      loading: false,
      errors: [],
      orders: sorted,
      rawOrders: validOrders,
      selectedOrder: null,
      aiAnalysis: null,
      recommendations: null,
      lastRefresh: Date.now(),
    }));
  };

  /* ── Handle Edge Case Test Run ─────────────────────────────────── */
  const handleRunEdgeCase = (sortedOrders, valResult, scenario) => {
    setDataMode('edge');
    setValidationResult(valResult);
    setState((prev) => ({
      ...prev,
      loading: false,
      errors: [],
      orders: sortedOrders,
      selectedOrder: null,
      aiAnalysis: null,
      recommendations: null,
      lastRefresh: Date.now(),
    }));
  };

  /* ── Reset to Demo Dataset ─────────────────────────────────────── */
  const handleResetToDemo = () => {
    setDataMode('demo');
    setValidationResult(null);
    setShowIssuesModal(false);
    loadDemoData();
  };

  /* ── Select Order Details Handler ──────────────────────────────── */
  const handleSelectOrder = useCallback((order) => {
    const rec = getRecommendations(order);
    const ai = analyzeOrder(order, rec);
    setState((prev) => ({
      ...prev,
      selectedOrder: order,
      recommendations: rec,
      aiAnalysis: ai,
    }));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setState((prev) => ({ ...prev, selectedOrder: null, aiAnalysis: null, recommendations: null }));
  }, []);

  const { loading, errors, orders, selectedOrder, aiAnalysis, recommendations, lastRefresh } = state;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lastRefresh={lastRefresh} onRefresh={loadDemoData} />

      <SummaryBanner />

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* 1. Dataset Mode Selector */}
        <section aria-label="Dataset Mode Selector">
          <DataSourceSelector
            dataMode={dataMode}
            setDataMode={(mode) => {
              setDataMode(mode);
              if (mode === 'demo') handleResetToDemo();
            }}
            onReset={handleResetToDemo}
          />
        </section>

        {/* 2. Custom CSV Upload Panel */}
        {dataMode === 'upload' && (
          <section aria-label="Upload Dataset">
            <UploadPanel onValidate={handleValidateUploadedFiles} />
          </section>
        )}

        {/* 3. Validation Summary Card */}
        {validationResult && (
          <section aria-label="Validation Summary">
            <ValidationSummary
              result={validationResult}
              onViewIssues={() => setShowIssuesModal(true)}
              onProcess={handleProcessValidRecords}
            />
          </section>
        )}

        {/* 4. Edge Case Testing Panel */}
        <section aria-label="Edge Case Testing">
          <EdgeCaseTester onRunEdgeCase={handleRunEdgeCase} />
        </section>

        {/* Loading Skeleton */}
        {loading && <LoadingSkeleton />}

        {/* CSV Error Banner */}
        {!loading && errors.length > 0 && <ValidationBanner errors={errors} />}

        {/* Main Dashboard Sections */}
        {!loading && errors.length === 0 && (
          <>
            {orders.length === 0 ? (
              /* Empty Dataset State */
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-card">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TbInfoCircle className="text-slate-400 text-3xl" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No Valid Orders Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  The dataset contains no valid records to process into the risk engine. Upload a valid CSV dataset or select a demo edge case.
                </p>
                <button
                  onClick={handleResetToDemo}
                  className="btn-primary"
                >
                  Reset to Demo Dataset
                </button>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <section aria-label="KPI Summary">
                  <p className="section-title">Key Performance Indicators</p>
                  <KPICards orders={orders} />
                </section>

                {/* Charts */}
                <section aria-label="Risk Charts">
                  <p className="section-title">Risk Analytics</p>
                  <Charts orders={orders} />
                </section>

                {/* Priority Queue + Detail Panel */}
                <section aria-label="Priority Queue">
                  <p className="section-title">Order Intelligence</p>

                  {selectedOrder ? (
                    /* Detail view layout */
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                      {/* Priority Queue */}
                      <div className="xl:col-span-1">
                        <PriorityQueue
                          orders={orders}
                          selectedId={selectedOrder?.Order_ID}
                          onSelect={handleSelectOrder}
                        />
                      </div>

                      {/* Right panel split */}
                      <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <OrderDetails order={selectedOrder} onClose={handleCloseDetails} />
                        </div>
                        <div className="space-y-4">
                          <RecommendationPanel aiAnalysis={aiAnalysis} recommendations={recommendations} />
                          <BeforeAfterPanel order={selectedOrder} aiAnalysis={aiAnalysis} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default: queue + hint */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-1">
                        <PriorityQueue
                          orders={orders}
                          selectedId={null}
                          onSelect={handleSelectOrder}
                        />
                      </div>
                      <div className="lg:col-span-2 flex items-center justify-center">
                        <div className="text-center py-16 px-8">
                          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TbInfoCircle className="text-brand-400 text-2xl" />
                          </div>
                          <p className="text-slate-600 font-semibold">Select an order to view details</p>
                          <p className="text-slate-400 text-sm mt-1">
                            Click any order in the queue or table below to see AI risk analysis, recommendations, and before/after comparison.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Order Table */}
                <section aria-label="All Orders">
                  <OrderTable
                    orders={orders}
                    selectedId={selectedOrder?.Order_ID}
                    onSelect={handleSelectOrder}
                  />
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Issues Modal */}
      {showIssuesModal && validationResult && (
        <IssuesPanel
          issues={validationResult.issues}
          onClose={() => setShowIssuesModal(false)}
        />
      )}

      {/* Network Status Modal */}
      <NetworkStatusModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onRetry={() => {
          setIsNetworkModalOpen(false);
          loadDemoData();
        }}
      />
    </div>
  );
}
