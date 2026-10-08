import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Boxes,
  CircleDollarSign,
  PackageSearch,
  TrendingUp,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getDashboardOverview,
  getForecastTrend,
  type DashboardOverviewResponse,
  type ForecastTrendPoint,
} from "../services/dashboardApi";


type ChartPoint = {
  x: number;
  y: number;
  value: number;
  date: string;
};


export default function DashboardPage() {
  const {
    user,
  } = useAuth();


  const navigate =
    useNavigate();


  const [
    overview,
    setOverview,
  ] =
    useState<
      DashboardOverviewResponse | null
    >(null);


  const [
    forecastPoints,
    setForecastPoints,
  ] =
    useState<
      ForecastTrendPoint[]
    >([]);


  const [
    dashboardLoading,
    setDashboardLoading,
  ] =
    useState(true);


  const [
    dashboardError,
    setDashboardError,
  ] =
    useState("");


  // ========================================================
  // LOAD DASHBOARD
  // ========================================================

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setDashboardLoading(
            true
          );

          setDashboardError(
            ""
          );


          // =================================================
          // MAIN DASHBOARD DATA
          // =================================================

          const overviewData =
            await getDashboardOverview();


          setOverview(
            overviewData
          );


          // =================================================
          // FORECAST TREND
          // OPTIONAL:
          // If this fails, main dashboard must still work.
          // =================================================

          try {
            const trendData =
              await getForecastTrend();


            setForecastPoints(
              trendData.points ??
                []
            );

          } catch (
            trendError
          ) {

            console.error(
              "Forecast trend error:",
              trendError
            );


            setForecastPoints(
              []
            );

          }

        } catch (
          error
        ) {

          console.error(
            "Dashboard overview error:",
            error
          );


          setDashboardError(
            "Unable to load dashboard data."
          );

        } finally {

          setDashboardLoading(
            false
          );

        }
      };


    loadDashboard();

  }, []);


  // ========================================================
  // USER
  // ========================================================

  const firstName =
    user?.full_name
      ?.trim()
      ?.split(" ")[0] ||
    "User";


  // ========================================================
  // INVENTORY
  // ========================================================

  const inventory =
    overview?.inventory_status;


  const totalItems =
    inventory?.total_items ??
    0;


  const inventoryPercentages =
    useMemo(
      () => {
        if (
          !inventory ||
          totalItems <= 0
        ) {
          return {
            healthy: 0,
            lowStock: 0,
            critical: 0,
            excess: 0,
          };
        }


        return {
          healthy:
            (
              inventory.healthy /
              totalItems
            ) * 100,

          lowStock:
            (
              inventory.low_stock /
              totalItems
            ) * 100,

          critical:
            (
              inventory.critical /
              totalItems
            ) * 100,

          excess:
            (
              inventory.excess /
              totalItems
            ) * 100,
        };
      },
      [
        inventory,
        totalItems,
      ]
    );


  // ========================================================
  // CURRENCY
  // ========================================================

  const formatCurrency =
    (
      value:
        | number
        | null
        | undefined
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "—";
      }


      return `₹${value.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits:
            0,
        }
      )}`;
    };


  // ========================================================
  // CHART DATA
  // ========================================================

  const chartData =
    useMemo(
      () => {

        const validValues =
          forecastPoints
            .flatMap(
              (
                point
              ) => [
                point.actual,
                point.forecast,
              ]
            )
            .filter(
              (
                value
              ): value is number =>
                typeof value ===
                  "number" &&
                Number.isFinite(
                  value
                )
            );


        if (
          forecastPoints.length ===
            0 ||
          validValues.length ===
            0
        ) {
          return null;
        }


        const chartWidth =
          760;

        const chartHeight =
          300;

        const topPadding =
          30;

        const bottomPadding =
          35;


        const minValue =
          Math.min(
            ...validValues
          );


        const maxValue =
          Math.max(
            ...validValues
          );


        const range =
          maxValue -
            minValue ||
          1;


        const scaleY =
          (
            value: number
          ) => {
            const usableHeight =
              chartHeight -
              topPadding -
              bottomPadding;


            return (
              topPadding +
              (
                1 -
                  (
                    value -
                    minValue
                  ) /
                    range
              ) *
                usableHeight
            );
          };


        const scaleX =
          (
            index: number
          ) => {
            if (
              forecastPoints.length <=
              1
            ) {
              return (
                chartWidth /
                2
              );
            }


            return (
              index /
              (
                forecastPoints.length -
                1
              )
            ) *
              chartWidth;
          };


        const actualPoints:
          ChartPoint[] =
            [];


        const predictedPoints:
          ChartPoint[] =
            [];


        forecastPoints.forEach(
          (
            point,
            index
          ) => {

            if (
              point.actual !==
                null &&
              point.actual !==
                undefined
            ) {
              actualPoints.push(
                {
                  x:
                    scaleX(
                      index
                    ),

                  y:
                    scaleY(
                      point.actual
                    ),

                  value:
                    point.actual,

                  date:
                    point.date,
                }
              );
            }


            if (
              point.forecast !==
                null &&
              point.forecast !==
                undefined
            ) {
              predictedPoints.push(
                {
                  x:
                    scaleX(
                      index
                    ),

                  y:
                    scaleY(
                      point.forecast
                    ),

                  value:
                    point.forecast,

                  date:
                    point.date,
                }
              );
            }

          }
        );


        const buildPath =
          (
            points:
              ChartPoint[]
          ) => {
            if (
              points.length ===
              0
            ) {
              return "";
            }


            return points
              .map(
                (
                  point,
                  index
                ) =>
                  `${
                    index === 0
                      ? "M"
                      : "L"
                  } ${point.x} ${point.y}`
              )
              .join(
                " "
              );
          };


        const actualPath =
          buildPath(
            actualPoints
          );


        const forecastPath =
          buildPath(
            predictedPoints
          );


        const yTicks =
          Array.from(
            {
              length: 5,
            },
            (
              _,
              index
            ) => {

              const value =
                maxValue -
                (
                  range /
                  4
                ) *
                  index;


              const y =
                topPadding +
                (
                  (
                    chartHeight -
                    topPadding -
                    bottomPadding
                  ) /
                  4
                ) *
                  index;


              return {
                value,
                y,
              };
            }
          );


        const labelStep =
          Math.max(
            1,
            Math.ceil(
              forecastPoints.length /
              6
            )
          );


        const labels =
          forecastPoints
            .filter(
              (
                _,
                index
              ) =>
                index %
                  labelStep ===
                0
            )
            .slice(
              0,
              6
            );


        return {
          chartWidth,
          chartHeight,
          actualPoints,
          predictedPoints,
          actualPath,
          forecastPath,
          yTicks,
          labels,
        };
      },
      [
        forecastPoints,
      ]
    );


  return (
    <div className="dashboard-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="dashboard-heading">

        <div>

          <span className="dashboard-eyebrow">
            DECISION INTELLIGENCE
          </span>


          <h1>
            Good morning, {firstName}
          </h1>


          <p>
            Here&apos;s your supply-chain
            intelligence overview.
          </p>

        </div>


        <div className="dashboard-heading-actions">

          <button
            type="button"
            className="dashboard-secondary-button"

            onClick={() =>
              navigate(
                "/dashboard/reports"
              )
            }
          >
            Export Report
          </button>


          {user?.role ===
            "Analyst" && (

            <button
              type="button"
              className="dashboard-primary-button"

              onClick={() =>
                navigate(
                  "/dashboard/run-analysis"
                )
              }
            >
              Run Analysis
            </button>

          )}

        </div>

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {dashboardError && (

        <div className="dashboard-data-error">
          {dashboardError}
        </div>

      )}


      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <section className="dashboard-kpi-grid">


        {/* FORECAST ACCURACY */}

        <article className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div>

              <span>
                FORECAST ACCURACY
              </span>


              <strong>

                {dashboardLoading
                  ? "..."
                  : overview
                  ? `${overview.forecast_accuracy.toFixed(
                      2
                    )}%`
                  : "—"}

              </strong>

            </div>


            <div className="dashboard-kpi-icon">

              <TrendingUp
                size={19}
              />

            </div>

          </div>


          <p className="kpi-change positive">
            Retail demand forecasting
          </p>

        </article>


        {/* TRACKED INVENTORY */}

        <article className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div>

              <span>
                TRACKED INVENTORY
              </span>


              <strong>

                {dashboardLoading
                  ? "..."
                  : overview
                  ? overview
                      .inventory_status
                      .total_items
                      .toLocaleString(
                        "en-IN"
                      )
                  : "—"}

              </strong>

            </div>


            <div className="dashboard-kpi-icon">

              <Boxes
                size={19}
              />

            </div>

          </div>


          <p className="kpi-change">
            Total inventory records analyzed
          </p>

        </article>


        {/* CRITICAL ITEMS */}

        <article className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div>

              <span>
                CRITICAL ITEMS
              </span>


              <strong>

                {dashboardLoading
                  ? "..."
                  : overview
                  ? overview
                      .inventory_status
                      .critical
                      .toLocaleString(
                        "en-IN"
                      )
                  : "—"}

              </strong>

            </div>


            <div className="dashboard-kpi-icon">

              <PackageSearch
                size={19}
              />

            </div>

          </div>


          <p className="kpi-change danger">
            Below safety-stock level
          </p>

        </article>


        {/* POTENTIAL SAVINGS */}

        <article className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div>

              <span>
                POTENTIAL SAVINGS
              </span>


              <strong>

                {dashboardLoading
                  ? "..."
                  : formatCurrency(
                      overview
                        ?.potential_savings
                    )}

              </strong>

            </div>


            <div className="dashboard-kpi-icon">

              <CircleDollarSign
                size={19}
              />

            </div>

          </div>


          <p className="kpi-change positive">
            Annual holding-cost opportunity
          </p>

        </article>

      </section>


      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <section className="dashboard-main-grid">


        {/* =================================================
            FORECAST CHART
        ================================================= */}

        <article className="dashboard-panel forecast-panel">

          <div className="panel-heading">

            <div>

              <span>
                DEMAND INTELLIGENCE
              </span>


              <h3>
                Demand Forecast Trend
              </h3>


              <p className="forecast-panel-subtitle">
                Historical demand and model
                forecast from recorded analyses
              </p>

            </div>


            <span className="model-active-badge">
              LIVE
            </span>

          </div>


          {!chartData ? (

            <div className="forecast-no-data">

              <strong>
                No forecast history yet
              </strong>


              <p>
                Run Supply Chain CSV analysis
                to generate forecast-trend
                points.
              </p>

            </div>

          ) : (

            <>

              <div className="forecast-reference-chart">


                {/* Y AXIS */}

                <div className="forecast-y-axis">

                  {chartData.yTicks.map(
                    (
                      tick,
                      index
                    ) => (

                      <span
                        key={
                          index
                        }
                      >
                        {tick.value.toFixed(
                          0
                        )}
                      </span>

                    )
                  )}

                </div>


                {/* CHART BODY */}

                <div className="forecast-chart-body">

                  <svg
                    viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`}

                    preserveAspectRatio="none"

                    role="img"

                    aria-label="Demand forecast trend"
                  >


                    {/* GRID */}

                    {chartData.yTicks.map(
                      (
                        tick,
                        index
                      ) => (

                        <line
                          key={
                            `grid-${index}`
                          }

                          x1="0"

                          y1={
                            tick.y
                          }

                          x2={
                            chartData.chartWidth
                          }

                          y2={
                            tick.y
                          }

                          className="forecast-grid-line"
                        />

                      )
                    )}


                    {/* HISTORICAL LINE */}

                    {chartData.actualPath && (

                      <path
                        d={
                          chartData.actualPath
                        }

                        className="forecast-history-line"
                      />

                    )}


                    {/* FORECAST LINE */}

                    {chartData.forecastPath && (

                      <path
                        d={
                          chartData.forecastPath
                        }

                        className="forecast-projected-line"
                      />

                    )}


                    {/* ACTUAL POINTS */}

                    {chartData.actualPoints.map(
                      (
                        point,
                        index
                      ) => (

                        <circle
                          key={
                            `actual-${index}`
                          }

                          cx={
                            point.x
                          }

                          cy={
                            point.y
                          }

                          r="4"

                          className="forecast-actual-point"
                        >

                          <title>

                            {`${point.date}: ${point.value.toFixed(
                              2
                            )} units actual`}

                          </title>

                        </circle>

                      )
                    )}


                    {/* FORECAST POINTS */}

                    {chartData.predictedPoints.map(
                      (
                        point,
                        index
                      ) => (

                        <circle
                          key={
                            `forecast-${index}`
                          }

                          cx={
                            point.x
                          }

                          cy={
                            point.y
                          }

                          r="4"

                          className="forecast-point"
                        >

                          <title>

                            {`${point.date}: ${point.value.toFixed(
                              2
                            )} units forecast`}

                          </title>

                        </circle>

                      )
                    )}

                  </svg>


                  {/* X AXIS */}

                  <div className="forecast-x-axis">

                    {chartData.labels.map(
                      (
                        point,
                        index
                      ) => {

                        const date =
                          new Date(
                            point.date
                          );


                        return (

                          <span
                            key={
                              index
                            }
                          >

                            {date.toLocaleDateString(
                              "en-US",
                              {
                                month:
                                  "short",

                                day:
                                  "numeric",
                              }
                            )}

                          </span>

                        );
                      }
                    )}

                  </div>

                </div>

              </div>


              {/* LEGEND */}

              <div className="forecast-chart-footer">

                <div className="forecast-chart-legend">

                  <span>

                    <i className="forecast-legend historical" />

                    Historical demand

                  </span>


                  <span>

                    <i className="forecast-legend projected" />

                    Forecast demand

                  </span>

                </div>


                <div className="forecast-chart-status">

                  <span className="forecast-status-dot" />

                  LIVE MODEL DATA

                </div>

              </div>

            </>

          )}

        </article>


        {/* =================================================
            INVENTORY
        ================================================= */}

        <article className="dashboard-panel inventory-panel">

          <div className="panel-heading">

            <div>

              <span>
                INVENTORY HEALTH
              </span>


              <h3>
                Inventory Status
              </h3>

            </div>

          </div>


          <div className="inventory-summary">


            <div
              className="inventory-ring"

              style={{
                background:
                  totalItems > 0
                    ? `conic-gradient(
                        #49b85a
                        0%
                        ${inventoryPercentages.healthy}%,

                        #f4b928
                        ${inventoryPercentages.healthy}%
                        ${
                          inventoryPercentages.healthy +
                          inventoryPercentages.lowStock
                        }%,

                        #db3f29
                        ${
                          inventoryPercentages.healthy +
                          inventoryPercentages.lowStock
                        }%
                        ${
                          inventoryPercentages.healthy +
                          inventoryPercentages.lowStock +
                          inventoryPercentages.critical
                        }%,

                        #135d6e
                        ${
                          inventoryPercentages.healthy +
                          inventoryPercentages.lowStock +
                          inventoryPercentages.critical
                        }%
                        100%
                      )`
                    : undefined,
              }}
            >

              <div className="inventory-ring-center">

                <strong>

                  {dashboardLoading
                    ? "..."
                    : totalItems.toLocaleString(
                        "en-IN"
                      )}

                </strong>


                <span>
                  ITEMS
                </span>

              </div>

            </div>


            <div className="inventory-status-list">


              <div className="inventory-status-row">

                <span>

                  <i className="inventory-dot healthy" />

                  Healthy

                </span>


                <strong>
                  {inventory?.healthy ?? "—"}
                </strong>

              </div>


              <div className="inventory-status-row">

                <span>

                  <i className="inventory-dot low" />

                  Low Stock

                </span>


                <strong>
                  {inventory?.low_stock ?? "—"}
                </strong>

              </div>


              <div className="inventory-status-row">

                <span>

                  <i className="inventory-dot critical" />

                  Critical

                </span>


                <strong>
                  {inventory?.critical ?? "—"}
                </strong>

              </div>


              <div className="inventory-status-row">

                <span>

                  <i className="inventory-dot excess" />

                  Excess

                </span>


                <strong>
                  {inventory?.excess ?? "—"}
                </strong>

              </div>

            </div>

          </div>


          <div className="inventory-total-value">

            <span>
              Total Inventory Value
            </span>


            <strong>

              {formatCurrency(
                overview
                  ?.inventory_value
              )}

            </strong>

          </div>


          <div className="inventory-total-value">

            <span>
              Potential Holding-Cost Savings
            </span>


            <strong>

              {formatCurrency(
                overview
                  ?.potential_savings
              )}

            </strong>

          </div>

        </article>


        {/* =================================================
            AI INSIGHTS
        ================================================= */}

        <article className="dashboard-panel intelligence-panel">

          <div className="panel-heading">

            <div>

              <span>
                DECISION INTELLIGENCE
              </span>


              <h3>
                AI Insights
              </h3>

            </div>

          </div>


          <div className="dashboard-insights">


            <div className="dashboard-insight">

              <strong>
                Inventory optimization
              </strong>


              <p>

                {overview
                  ? `${overview.inventory_status.excess.toLocaleString(
                      "en-IN"
                    )} items currently show excess inventory based on recommended stock levels.`
                  : "Loading inventory intelligence..."}

              </p>

            </div>


            <div className="dashboard-insight">

              <strong>
                Replenishment attention
              </strong>


              <p>

                {overview
                  ? `${(
                      overview.inventory_status.low_stock +
                      overview.inventory_status.critical
                    ).toLocaleString(
                      "en-IN"
                    )} items require inventory monitoring or replenishment review.`
                  : "Loading inventory intelligence..."}

              </p>

            </div>


            <div className="dashboard-insight">

              <strong>
                Cost opportunity
              </strong>


              <p>

                {overview
                  ?.potential_savings !==
                    null &&
                  overview
                    ?.potential_savings !==
                    undefined
                  ? `${formatCurrency(
                      overview.potential_savings
                    )} in estimated annual holding-cost savings is identified in the optimization data.`
                  : "Savings information is not available."}

              </p>

            </div>

          </div>

        </article>


        {/* =================================================
            MODEL HEALTH
        ================================================= */}

        <article className="dashboard-panel model-health-panel">

          <div className="panel-heading">

            <div>

              <span>
                ML SYSTEM
              </span>


              <h3>
                Model Health
              </h3>

            </div>

          </div>


          <div className="model-health-list">


            <div className="model-health-row">

              <div>

                <span>
                  Supply Chain
                </span>


                <strong>

                  {overview
                    ?.models
                    .supply_chain
                    .name ??
                    "—"}

                </strong>

              </div>


              <span className="model-active-badge">
                ACTIVE
              </span>

            </div>


            <div className="model-health-row">

              <div>

                <span>
                  Retail
                </span>


                <strong>

                  {overview
                    ?.models
                    .retail
                    .name ??
                    "—"}

                </strong>

              </div>


              <span className="model-active-badge">
                ACTIVE
              </span>

            </div>


            <div className="model-health-row">

              <div>

                <span>
                  Logistics
                </span>


                <strong>

                  {overview
                    ?.models
                    .logistics
                    .name ??
                    "—"}

                </strong>

              </div>


              <span className="model-active-badge">
                ACTIVE
              </span>

            </div>


            <div className="model-health-row">

              <div>

                <span>
                  Stockout
                </span>


                <strong>

                  {overview
                    ?.models
                    .stockout
                    .name ??
                    "—"}

                </strong>

              </div>


              <span className="model-active-badge">
                ACTIVE
              </span>

            </div>

          </div>

        </article>

      </section>

    </div>
  );
}