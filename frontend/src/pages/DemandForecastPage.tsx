import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getForecastTrend,
  type ForecastTrendPoint,
} from "../services/dashboardApi";


type ChartPoint = {
  x: number;
  y: number;
  value: number;
  date: string;
};


export default function DemandForecastPage() {
  const {
    user,
  } = useAuth();


  const navigate =
    useNavigate();


  const [
    forecastPoints,
    setForecastPoints,
  ] =
    useState<
      ForecastTrendPoint[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  // ========================================================
  // LOAD FORECAST DATA
  // ========================================================

  useEffect(() => {
    const loadForecast =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );


          const response =
            await getForecastTrend();


          setForecastPoints(
            response.points ??
              []
          );

        } catch (err) {

          console.error(
            "Demand forecast error:",
            err
          );


          setForecastPoints(
            []
          );


          setError(
            "Unable to load demand forecast data."
          );

        } finally {

          setLoading(
            false
          );

        }
      };


    loadForecast();

  }, []);


  // ========================================================
  // VALID POINTS
  // ========================================================

  const validForecasts =
    useMemo(
      () =>
        forecastPoints.filter(
          (
            point
          ) =>
            point.forecast !==
              null &&
            point.forecast !==
              undefined &&
            Number.isFinite(
              point.forecast
            )
        ),
      [
        forecastPoints,
      ]
    );


  const validActuals =
    useMemo(
      () =>
        forecastPoints.filter(
          (
            point
          ) =>
            point.actual !==
              null &&
            point.actual !==
              undefined &&
            Number.isFinite(
              point.actual
            )
        ),
      [
        forecastPoints,
      ]
    );


  // ========================================================
  // KPIs
  // ========================================================

  const latestForecast =
    validForecasts.length
      ? validForecasts[
          validForecasts.length -
            1
        ].forecast
      : null;


  const averageForecast =
    validForecasts.length
      ? validForecasts.reduce(
          (
            total,
            point
          ) =>
            total +
            Number(
              point.forecast
            ),
          0
        ) /
        validForecasts.length
      : null;


  const averageActual =
    validActuals.length
      ? validActuals.reduce(
          (
            total,
            point
          ) =>
            total +
            Number(
              point.actual
            ),
          0
        ) /
        validActuals.length
      : null;


  const averageAbsoluteError =
    useMemo(
      () => {
        const pairs =
          forecastPoints.filter(
            (
              point
            ) =>
              point.actual !==
                null &&
              point.actual !==
                undefined &&
              point.forecast !==
                null &&
              point.forecast !==
                undefined
          );


        if (
          pairs.length ===
          0
        ) {
          return null;
        }


        return (
          pairs.reduce(
            (
              total,
              point
            ) =>
              total +
              Math.abs(
                Number(
                  point.actual
                ) -
                  Number(
                    point.forecast
                  )
              ),
            0
          ) /
          pairs.length
        );
      },
      [
        forecastPoints,
      ]
    );


  // ========================================================
  // TREND DIRECTION
  // ========================================================

  const trendDirection =
    useMemo(
      () => {
        if (
          validForecasts.length <
          2
        ) {
          return {
            label:
              "Stable",

            change:
              0,

            positive:
              true,
          };
        }


        const previous =
          Number(
            validForecasts[
              validForecasts.length -
                2
            ].forecast
          );


        const latest =
          Number(
            validForecasts[
              validForecasts.length -
                1
            ].forecast
          );


        if (
          previous === 0
        ) {
          return {
            label:
              latest >= 0
                ? "Increasing"
                : "Decreasing",

            change:
              0,

            positive:
              latest >= 0,
          };
        }


        const change =
          (
            (
              latest -
              previous
            ) /
            Math.abs(
              previous
            )
          ) *
          100;


        return {
          label:
            change >= 0
              ? "Increasing"
              : "Decreasing",

          change:
            Math.abs(
              change
            ),

          positive:
            change >= 0,
        };
      },
      [
        validForecasts,
      ]
    );


  // ========================================================
  // CHART DATA
  // ========================================================

  const chartData =
    useMemo(
      () => {

        const values =
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
          values.length ===
            0
        ) {
          return null;
        }


        const width =
          900;

        const height =
          330;

        const topPadding =
          25;

        const bottomPadding =
          35;


        const minValue =
          Math.min(
            ...values
          );


        const maxValue =
          Math.max(
            ...values
          );


        const range =
          maxValue -
            minValue ||
          1;


        const scaleX =
          (
            index: number
          ) => {
            if (
              forecastPoints.length <=
              1
            ) {
              return (
                width /
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
              width;
          };


        const scaleY =
          (
            value: number
          ) => {
            const usableHeight =
              height -
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


        const actualPoints:
          ChartPoint[] =
            [];


        const forecastChartPoints:
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
              forecastChartPoints.push(
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
          ) =>
            points
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
                    height -
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
            .map(
              (
                point,
                index
              ) => ({
                point,
                index,
              })
            )
            .filter(
              (
                item
              ) =>
                item.index %
                  labelStep ===
                0
            )
            .slice(
              0,
              6
            );


        return {
          width,
          height,

          actualPoints,
          forecastChartPoints,

          actualPath:
            buildPath(
              actualPoints
            ),

          forecastPath:
            buildPath(
              forecastChartPoints
            ),

          yTicks,
          labels,
        };
      },
      [
        forecastPoints,
      ]
    );


  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate =
    (
      dateValue:
        string
    ) => {
      const date =
        new Date(
          dateValue
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return dateValue;
      }


      return date.toLocaleDateString(
        "en-US",
        {
          month:
            "short",

          day:
            "numeric",

          year:
            "numeric",
        }
      );
    };


  // ========================================================
  // FORMAT NUMBER
  // ========================================================

  const formatNumber =
    (
      value:
        number |
        null |
        undefined
    ) => {
      if (
        value === null ||
        value === undefined ||
        !Number.isFinite(
          value
        )
      ) {
        return "—";
      }


      return value.toFixed(
        2
      );
    };


  return (
    <div className="demand-forecast-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="forecast-page-header">

        <div>

          <span className="dashboard-eyebrow">
            DEMAND INTELLIGENCE
          </span>


          <h1>
            Demand Forecast
          </h1>


          <p>
            Compare historical demand with
            machine-learning forecasts and
            monitor recent demand movement.
          </p>

        </div>


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
            Run New Forecast
          </button>

        )}

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <section className="forecast-kpi-grid">


        {/* LATEST FORECAST */}

        <article className="forecast-kpi-card">

          <div className="forecast-kpi-icon">
            <TrendingUp
              size={18}
            />
          </div>


          <span>
            LATEST FORECAST
          </span>


          <strong>

            {loading
              ? "..."
              : formatNumber(
                  latestForecast
                )}

          </strong>


          <p>
            Units predicted
          </p>

        </article>


        {/* AVERAGE FORECAST */}

        <article className="forecast-kpi-card">

          <div className="forecast-kpi-icon">
            <BarChart3
              size={18}
            />
          </div>


          <span>
            AVG. FORECAST
          </span>


          <strong>

            {loading
              ? "..."
              : formatNumber(
                  averageForecast
                )}

          </strong>


          <p>
            Across recorded forecasts
          </p>

        </article>


        {/* AVERAGE ACTUAL */}

        <article className="forecast-kpi-card">

          <div className="forecast-kpi-icon">
            <Activity
              size={18}
            />
          </div>


          <span>
            AVG. ACTUAL DEMAND
          </span>


          <strong>

            {loading
              ? "..."
              : formatNumber(
                  averageActual
                )}

          </strong>


          <p>
            Historical observed demand
          </p>

        </article>


        {/* MAE */}

        <article className="forecast-kpi-card">

          <div className="forecast-kpi-icon">
            <Target
              size={18}
            />
          </div>


          <span>
            AVG. ABSOLUTE ERROR
          </span>


          <strong>

            {loading
              ? "..."
              : formatNumber(
                  averageAbsoluteError
                )}

          </strong>


          <p>
            Actual vs forecast
          </p>

        </article>

      </section>


      {/* ==================================================
          MAIN CHART
      ================================================== */}

      <section className="dashboard-panel demand-forecast-chart-panel">


        <div className="panel-heading">

          <div>

            <span>
              FORECAST PERFORMANCE
            </span>


            <h3>
              Actual vs Forecast Demand
            </h3>


            <p className="forecast-panel-subtitle">
              Real prediction history generated
              from Supply Chain CSV analysis.
            </p>

          </div>


          <div
            className={
              trendDirection
                .positive
                ? "forecast-trend-badge positive"
                : "forecast-trend-badge negative"
            }
          >

            {trendDirection
              .positive
              ? (
                <ArrowUpRight
                  size={14}
                />
              )
              : (
                <ArrowDownRight
                  size={14}
                />
              )}


            <span>
              {trendDirection.label}
            </span>


            <strong>
              {trendDirection.change.toFixed(
                1
              )}
              %
            </strong>

          </div>

        </div>


        {!chartData ? (

          <div className="forecast-page-empty">

            <strong>
              No forecast data yet
            </strong>


            <p>
              Run a Supply Chain CSV analysis
              to generate forecast history.
            </p>


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

        ) : (

          <div className="demand-analytics-chart">


            {/* Y AXIS */}

            <div className="demand-chart-y-axis">

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


            {/* GRAPH */}

            <div className="demand-chart-main">

              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}

                preserveAspectRatio="none"

                role="img"

                aria-label="Actual and forecast demand chart"
              >

                {/* GRADIENT */}

                <defs>

                  <linearGradient
                    id="forecastPageArea"

                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"

                      stopColor="#ff5a1f"

                      stopOpacity="0.12"
                    />


                    <stop
                      offset="100%"

                      stopColor="#ff5a1f"

                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>


                {/* GRID */}

                {chartData.yTicks.map(
                  (
                    tick,
                    index
                  ) => (

                    <line
                      key={
                        index
                      }

                      x1="0"

                      y1={
                        tick.y
                      }

                      x2={
                        chartData.width
                      }

                      y2={
                        tick.y
                      }

                      className="demand-chart-grid-line"
                    />

                  )
                )}


                {/* ACTUAL */}

                {chartData.actualPath && (

                  <path
                    d={
                      chartData.actualPath
                    }

                    className="demand-actual-line"
                  />

                )}


                {/* FORECAST */}

                {chartData.forecastPath && (

                  <path
                    d={
                      chartData.forecastPath
                    }

                    className="demand-forecast-line"
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

                      className="demand-actual-point"
                    >

                      <title>

                        {`${formatDate(
                          point.date
                        )} | Actual: ${point.value.toFixed(
                          2
                        )}`}

                      </title>

                    </circle>

                  )
                )}


                {/* FORECAST POINTS */}

                {chartData.forecastChartPoints.map(
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

                      className="demand-forecast-point"
                    >

                      <title>

                        {`${formatDate(
                          point.date
                        )} | Forecast: ${point.value.toFixed(
                          2
                        )}`}

                      </title>

                    </circle>

                  )
                )}

              </svg>


              {/* X AXIS */}

              <div className="demand-chart-x-axis">

                {chartData.labels.map(
                  (
                    item,
                    index
                  ) => (

                    <span
                      key={
                        index
                      }
                    >

                      {new Date(
                        item.point.date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month:
                            "short",

                          day:
                            "numeric",
                        }
                      )}

                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        )}


        {/* LEGEND */}

        <div className="demand-chart-legend">

          <span>

            <i className="demand-legend actual" />

            Actual Demand

          </span>


          <span>

            <i className="demand-legend forecast" />

            Model Forecast

          </span>

        </div>

      </section>


      {/* ==================================================
          BOTTOM GRID
      ================================================== */}

      <section className="demand-forecast-bottom-grid">


        {/* RECENT FORECAST TABLE */}

        <article className="dashboard-panel demand-history-panel">

          <div className="panel-heading">

            <div>

              <span>
                RECENT ANALYSIS
              </span>


              <h3>
                Forecast History
              </h3>

            </div>

          </div>


          <div className="demand-table-wrapper">

            <table className="demand-forecast-table">

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Actual
                  </th>

                  <th>
                    Forecast
                  </th>

                  <th>
                    Error
                  </th>

                </tr>

              </thead>


              <tbody>

                {forecastPoints.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={
                        4
                      }

                      className="demand-empty-table"
                    >
                      No forecast records available.
                    </td>

                  </tr>

                ) : (

                  [...forecastPoints]
                    .reverse()
                    .slice(
                      0,
                      10
                    )
                    .map(
                      (
                        point,
                        index
                      ) => {

                        const errorValue =
                          point.actual !==
                            null &&
                          point.actual !==
                            undefined &&
                          point.forecast !==
                            null &&
                          point.forecast !==
                            undefined
                            ? Math.abs(
                                point.actual -
                                  point.forecast
                              )
                            : null;


                        return (

                          <tr
                            key={
                              `${point.date}-${index}`
                            }
                          >

                            <td>
                              {formatDate(
                                point.date
                              )}
                            </td>


                            <td>
                              {formatNumber(
                                point.actual
                              )}
                            </td>


                            <td className="forecast-value-cell">
                              {formatNumber(
                                point.forecast
                              )}
                            </td>


                            <td>
                              {formatNumber(
                                errorValue
                              )}
                            </td>

                          </tr>

                        );
                      }
                    )

                )}

              </tbody>

            </table>

          </div>

        </article>


        {/* FORECAST SUMMARY */}

        <article className="dashboard-panel demand-summary-panel">

          <div className="panel-heading">

            <div>

              <span>
                FORECAST SUMMARY
              </span>


              <h3>
                Demand Intelligence
              </h3>

            </div>

          </div>


          <div className="demand-summary-list">


            <div className="demand-summary-item">

              <span>
                Forecast records
              </span>

              <strong>
                {forecastPoints.length}
              </strong>

            </div>


            <div className="demand-summary-item">

              <span>
                Demand direction
              </span>

              <strong
                className={
                  trendDirection
                    .positive
                    ? "positive"
                    : "negative"
                }
              >
                {trendDirection.label}
              </strong>

            </div>


            <div className="demand-summary-item">

              <span>
                Average actual
              </span>

              <strong>
                {formatNumber(
                  averageActual
                )}
              </strong>

            </div>


            <div className="demand-summary-item">

              <span>
                Average forecast
              </span>

              <strong>
                {formatNumber(
                  averageForecast
                )}
              </strong>

            </div>


            <div className="demand-summary-item">

              <span>
                Average absolute error
              </span>

              <strong>
                {formatNumber(
                  averageAbsoluteError
                )}
              </strong>

            </div>


            <div className="demand-summary-item">

              <span>
                Model source
              </span>

              <strong>
                HistGradientBoosting
              </strong>

            </div>

          </div>

        </article>

      </section>

    </div>
  );
}