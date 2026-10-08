import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRightLeft,
  Building2,
  CalendarRange,
  PackageSearch,
  TrendingUp,
} from "lucide-react";

import {
  compareActualForecast,
  comparePeriods,
  compareProducts,
  compareWarehouses,
  getComparisonOptions,
  type ActualForecastResponse,
  type ComparisonOptions,
  type EntityComparisonResponse,
  type PeriodComparisonResponse,
} from "../services/dashboardApi";


type ComparisonTab =
  | "warehouse"
  | "product"
  | "period"
  | "forecast";


export default function ComparisonPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ComparisonTab>(
      "warehouse"
    );


  const [
    options,
    setOptions,
  ] =
    useState<ComparisonOptions>({
      warehouses: [],
      products: [],
    });


  const [
    warehouseA,
    setWarehouseA,
  ] =
    useState("");


  const [
    warehouseB,
    setWarehouseB,
  ] =
    useState("");


  const [
    productA,
    setProductA,
  ] =
    useState("");


  const [
    productB,
    setProductB,
  ] =
    useState("");


  const [
    entityComparison,
    setEntityComparison,
  ] =
    useState<EntityComparisonResponse | null>(
      null
    );


  const [
    periodComparison,
    setPeriodComparison,
  ] =
    useState<PeriodComparisonResponse | null>(
      null
    );


  const [
    forecastComparison,
    setForecastComparison,
  ] =
    useState<ActualForecastResponse | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  // ========================================================
  // LOAD OPTIONS
  // ========================================================

  useEffect(() => {
    const loadOptions =
      async () => {

        try {

          const response =
            await getComparisonOptions();


          setOptions(
            response
          );


          if (
            response.warehouses.length >= 2
          ) {

            setWarehouseA(
              response.warehouses[0]
            );

            setWarehouseB(
              response.warehouses[1]
            );

          }


          if (
            response.products.length >= 2
          ) {

            setProductA(
              response.products[0]
            );

            setProductB(
              response.products[1]
            );

          }

        } catch (err) {

          console.error(
            "Comparison options error:",
            err
          );


          setError(
            "Unable to load comparison options."
          );

        }

      };


    loadOptions();

  }, []);


  // ========================================================
  // FORMATTERS
  // ========================================================

  const number =
    (
      value:
        unknown
    ) => {

      if (
        typeof value !==
        "number"
      ) {
        return "—";
      }


      return value.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits:
            2,
        }
      );
    };


  const money =
    (
      value:
        unknown
    ) => {

      if (
        typeof value !==
        "number"
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


  const percent =
    (
      value:
        unknown
    ) => {

      if (
        typeof value !==
        "number"
      ) {
        return "—";
      }


      return `${(
        value *
        100
      ).toFixed(
        2
      )}%`;
    };


  // ========================================================
  // RUN WAREHOUSE
  // ========================================================

  const runWarehouseComparison =
    async () => {

      if (
        !warehouseA ||
        !warehouseB
      ) {
        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await compareWarehouses(
            warehouseA,
            warehouseB
          );


        setEntityComparison(
          response
        );


      } catch (err) {

        console.error(
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Warehouse comparison failed."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // ========================================================
  // RUN PRODUCT
  // ========================================================

  const runProductComparison =
    async () => {

      if (
        !productA ||
        !productB
      ) {
        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await compareProducts(
            productA,
            productB
          );


        setEntityComparison(
          response
        );


      } catch (err) {

        console.error(
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Product comparison failed."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // ========================================================
  // RUN PERIOD
  // ========================================================

  const runPeriodComparison =
    async () => {

      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await comparePeriods();


        setPeriodComparison(
          response
        );


      } catch (err) {

        console.error(
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Period comparison failed."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // ========================================================
  // RUN ACTUAL VS FORECAST
  // ========================================================

  const runForecastComparison =
    async () => {

      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await compareActualForecast();


        setForecastComparison(
          response
        );


      } catch (err) {

        console.error(
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Actual vs forecast comparison failed."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  // ========================================================
  // CHART POINTS
  // ========================================================

  const forecastChart =
    useMemo(
      () => {

        if (
          !forecastComparison?.points?.length
        ) {
          return [];
        }


        const width =
          900;

        const height =
          260;

        const paddingX =
          40;

        const paddingY =
          25;


        const values =
          forecastComparison.points.flatMap(
            point => [
              point.actual,
              point.forecast,
            ]
          );


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


        const total =
          forecastComparison
            .points
            .length;


        return forecastComparison
          .points
          .map(
            (
              point,
              index
            ) => {

              const x =
                total === 1
                  ? width / 2
                  : paddingX +
                    (
                      index /
                      (
                        total -
                        1
                      )
                    ) *
                    (
                      width -
                      paddingX *
                        2
                    );


              const actualY =
                height -
                paddingY -
                (
                  (
                    point.actual -
                    minValue
                  ) /
                  range
                ) *
                (
                  height -
                  paddingY *
                    2
                );


              const forecastY =
                height -
                paddingY -
                (
                  (
                    point.forecast -
                    minValue
                  ) /
                  range
                ) *
                (
                  height -
                  paddingY *
                    2
                );


              return {
                ...point,
                x,
                actualY,
                forecastY,
              };

            }
          );

      },
      [
        forecastComparison,
      ]
    );


  const actualPolyline =
    forecastChart
      .map(
        point =>
          `${point.x},${point.actualY}`
      )
      .join(
        " "
      );


  const forecastPolyline =
    forecastChart
      .map(
        point =>
          `${point.x},${point.forecastY}`
      )
      .join(
        " "
      );


  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="comparison-page">


      {/* HEADER */}

      <section className="comparison-header">

        <div>

          <span className="dashboard-eyebrow">
            DECISION COMPARISON
          </span>


          <h1>
            Comparison Mode
          </h1>


          <p>
            Compare operational performance
            across warehouses, products,
            historical periods and forecast
            accuracy using real SCOPTIMA data.
          </p>

        </div>

      </section>


      {/* TABS */}

      <section className="comparison-tabs">

        <button
          type="button"

          className={
            activeTab ===
            "warehouse"
              ? "active"
              : ""
          }

          onClick={() => {
            setActiveTab(
              "warehouse"
            );

            setEntityComparison(
              null
            );

            setError(
              ""
            );
          }}
        >

          <Building2
            size={15}
          />

          Warehouse

        </button>


        <button
          type="button"

          className={
            activeTab ===
            "product"
              ? "active"
              : ""
          }

          onClick={() => {
            setActiveTab(
              "product"
            );

            setEntityComparison(
              null
            );

            setError(
              ""
            );
          }}
        >

          <PackageSearch
            size={15}
          />

          Product

        </button>


        <button
          type="button"

          className={
            activeTab ===
            "period"
              ? "active"
              : ""
          }

          onClick={() => {
            setActiveTab(
              "period"
            );

            setError(
              ""
            );
          }}
        >

          <CalendarRange
            size={15}
          />

          Current vs Previous

        </button>


        <button
          type="button"

          className={
            activeTab ===
            "forecast"
              ? "active"
              : ""
          }

          onClick={() => {
            setActiveTab(
              "forecast"
            );

            setError(
              ""
            );
          }}
        >

          <TrendingUp
            size={15}
          />

          Actual vs Forecast

        </button>

      </section>


      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* ==================================================
          WAREHOUSE
      ================================================== */}

      {activeTab ===
        "warehouse" && (

        <>

          <section className="dashboard-panel comparison-selector-panel">

            <div className="comparison-selector-grid">

              <div>

                <label>
                  Warehouse A
                </label>


                <select
                  value={
                    warehouseA
                  }

                  onChange={(
                    event
                  ) =>
                    setWarehouseA(
                      event.target.value
                    )
                  }
                >

                  {options.warehouses.map(
                    warehouse => (

                      <option
                        key={
                          warehouse
                        }

                        value={
                          warehouse
                        }
                      >
                        {
                          warehouse
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="comparison-vs">
                <ArrowRightLeft
                  size={18}
                />

                VS
              </div>


              <div>

                <label>
                  Warehouse B
                </label>


                <select
                  value={
                    warehouseB
                  }

                  onChange={(
                    event
                  ) =>
                    setWarehouseB(
                      event.target.value
                    )
                  }
                >

                  {options.warehouses.map(
                    warehouse => (

                      <option
                        key={
                          warehouse
                        }

                        value={
                          warehouse
                        }
                      >
                        {
                          warehouse
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              <button
                type="button"

                className="dashboard-primary-button"

                disabled={
                  loading ||
                  !warehouseA ||
                  !warehouseB ||
                  warehouseA ===
                    warehouseB
                }

                onClick={
                  runWarehouseComparison
                }
              >
                {loading
                  ? "Comparing..."
                  : "Compare Warehouses"}
              </button>

            </div>

          </section>


          {entityComparison?.mode ===
            "warehouse" && (

            <EntityComparisonView
              left={
                entityComparison.left
              }

              right={
                entityComparison.right
              }

              type="warehouse"

              number={
                number
              }

              money={
                money
              }

              percent={
                percent
              }
            />

          )}

        </>

      )}


      {/* ==================================================
          PRODUCT
      ================================================== */}

      {activeTab ===
        "product" && (

        <>

          <section className="dashboard-panel comparison-selector-panel">

            <div className="comparison-selector-grid">

              <div>

                <label>
                  Product A
                </label>


                <select
                  value={
                    productA
                  }

                  onChange={(
                    event
                  ) =>
                    setProductA(
                      event.target.value
                    )
                  }
                >

                  {options.products.map(
                    product => (

                      <option
                        key={
                          product
                        }

                        value={
                          product
                        }
                      >
                        {
                          product
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="comparison-vs">
                <ArrowRightLeft
                  size={18}
                />

                VS
              </div>


              <div>

                <label>
                  Product B
                </label>


                <select
                  value={
                    productB
                  }

                  onChange={(
                    event
                  ) =>
                    setProductB(
                      event.target.value
                    )
                  }
                >

                  {options.products.map(
                    product => (

                      <option
                        key={
                          product
                        }

                        value={
                          product
                        }
                      >
                        {
                          product
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              <button
                type="button"

                className="dashboard-primary-button"

                disabled={
                  loading ||
                  !productA ||
                  !productB ||
                  productA ===
                    productB
                }

                onClick={
                  runProductComparison
                }
              >
                {loading
                  ? "Comparing..."
                  : "Compare Products"}
              </button>

            </div>

          </section>


          {entityComparison?.mode ===
            "product" && (

            <EntityComparisonView
              left={
                entityComparison.left
              }

              right={
                entityComparison.right
              }

              type="product"

              number={
                number
              }

              money={
                money
              }

              percent={
                percent
              }
            />

          )}

        </>

      )}


      {/* ==================================================
          PERIOD
      ================================================== */}

      {activeTab ===
        "period" && (

        <>

          <section className="dashboard-panel comparison-run-panel">

            <div>

              <span className="dashboard-eyebrow">
                TIME COMPARISON
              </span>


              <h3>
                Current vs Previous Period
              </h3>


              <p>
                Compare demand in the latest
                half of available history
                against the preceding half.
              </p>

            </div>


            <button
              type="button"

              className="dashboard-primary-button"

              disabled={
                loading
              }

              onClick={
                runPeriodComparison
              }
            >
              {loading
                ? "Comparing..."
                : "Run Period Comparison"}
            </button>

          </section>


          {periodComparison && (

            <>

              <section className="comparison-period-grid">


                <article className="dashboard-panel comparison-side-card">

                  <span>
                    PREVIOUS PERIOD
                  </span>


                  <h3>
                    {
                      periodComparison
                        .previous
                        .start_date
                    }
                    {" — "}
                    {
                      periodComparison
                        .previous
                        .end_date
                    }
                  </h3>


                  <ComparisonMetric
                    label="Records"

                    value={
                      number(
                        periodComparison
                          .previous
                          .records
                      )
                    }
                  />


                  <ComparisonMetric
                    label="Total Demand"

                    value={
                      number(
                        periodComparison
                          .previous
                          .total_demand
                      )
                    }
                  />


                  <ComparisonMetric
                    label="Average Demand"

                    value={
                      number(
                        periodComparison
                          .previous
                          .average_demand
                      )
                    }
                  />

                </article>


                <div className="comparison-change-card">

                  <span>
                    AVG DEMAND CHANGE
                  </span>


                  <strong
                    className={
                      periodComparison
                        .average_demand_change_percentage >=
                      0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {periodComparison
                      .average_demand_change_percentage >=
                    0
                      ? "+"
                      : ""}
                    {
                      periodComparison
                        .average_demand_change_percentage
                        .toFixed(
                          2
                        )
                    }%
                  </strong>

                </div>


                <article className="dashboard-panel comparison-side-card">

                  <span>
                    CURRENT PERIOD
                  </span>


                  <h3>
                    {
                      periodComparison
                        .current
                        .start_date
                    }
                    {" — "}
                    {
                      periodComparison
                        .current
                        .end_date
                    }
                  </h3>


                  <ComparisonMetric
                    label="Records"

                    value={
                      number(
                        periodComparison
                          .current
                          .records
                      )
                    }
                  />


                  <ComparisonMetric
                    label="Total Demand"

                    value={
                      number(
                        periodComparison
                          .current
                          .total_demand
                      )
                    }
                  />


                  <ComparisonMetric
                    label="Average Demand"

                    value={
                      number(
                        periodComparison
                          .current
                          .average_demand
                      )
                    }
                  />

                </article>

              </section>

            </>

          )}

        </>

      )}


      {/* ==================================================
          ACTUAL VS FORECAST
      ================================================== */}

      {activeTab ===
        "forecast" && (

        <>

          <section className="dashboard-panel comparison-run-panel">

            <div>

              <span className="dashboard-eyebrow">
                FORECAST VALIDATION
              </span>


              <h3>
                Actual vs Forecast
              </h3>


              <p>
                Compare observed demand
                against model-generated
                forecast history.
              </p>

            </div>


            <button
              type="button"

              className="dashboard-primary-button"

              disabled={
                loading
              }

              onClick={
                runForecastComparison
              }
            >
              {loading
                ? "Loading..."
                : "Compare Forecast"}
            </button>

          </section>


          {forecastComparison && (

            <>

              <section className="comparison-forecast-kpis">


                <article>

                  <span>
                    RECORDS
                  </span>


                  <strong>
                    {
                      forecastComparison
                        .summary
                        .records
                    }
                  </strong>

                </article>


                <article>

                  <span>
                    AVG ACTUAL
                  </span>


                  <strong>
                    {number(
                      forecastComparison
                        .summary
                        .average_actual
                    )}
                  </strong>

                </article>


                <article>

                  <span>
                    AVG FORECAST
                  </span>


                  <strong>
                    {number(
                      forecastComparison
                        .summary
                        .average_forecast
                    )}
                  </strong>

                </article>


                <article>

                  <span>
                    MAE
                  </span>


                  <strong>
                    {number(
                      forecastComparison
                        .summary
                        .mae
                    )}
                  </strong>

                </article>

              </section>


              <section className="dashboard-panel comparison-chart-panel">

                <div className="panel-heading">

                  <div>

                    <span>
                      DEMAND TREND
                    </span>


                    <h3>
                      Actual vs Forecast
                    </h3>

                  </div>


                  <div className="comparison-chart-legend">

                    <span>
                      Actual
                    </span>

                    <span>
                      Forecast
                    </span>

                  </div>

                </div>


                {forecastChart.length >
                0 ? (

                  <div className="comparison-svg-wrapper">

                    <svg
                      viewBox="0 0 900 260"

                      className="comparison-forecast-chart"

                      preserveAspectRatio="none"
                    >

                      {[40, 90, 140, 190, 240].map(
                        y => (

                          <line
                            key={
                              y
                            }

                            x1="35"
                            y1={
                              y
                            }
                            x2="870"
                            y2={
                              y
                            }

                            className="comparison-grid-line"
                          />

                        )
                      )}


                      <polyline
                        points={
                          actualPolyline
                        }

                        fill="none"

                        className="comparison-actual-line"
                      />


                      <polyline
                        points={
                          forecastPolyline
                        }

                        fill="none"

                        className="comparison-forecast-line"
                      />


                      {forecastChart.map(
                        point => (

                          <g
                            key={
                              `${point.date}-${point.x}`
                            }
                          >

                            <circle
                              cx={
                                point.x
                              }

                              cy={
                                point.actualY
                              }

                              r="3"

                              className="comparison-actual-point"
                            >

                              <title>
                                {`${point.date} Actual: ${point.actual}`}
                              </title>

                            </circle>


                            <circle
                              cx={
                                point.x
                              }

                              cy={
                                point.forecastY
                              }

                              r="3"

                              className="comparison-forecast-point"
                            >

                              <title>
                                {`${point.date} Forecast: ${point.forecast}`}
                              </title>

                            </circle>

                          </g>

                        )
                      )}

                    </svg>

                  </div>

                ) : (

                  <div className="comparison-empty-state">

                    No forecast history available.

                  </div>

                )}

              </section>

            </>

          )}

        </>

      )}

    </div>
  );
}


// ==========================================================
// ENTITY COMPARISON
// ==========================================================

function EntityComparisonView({
  left,
  right,
  type,
  number,
  money,
  percent,
}: {
  left: Record<
    string,
    string | number
  >;

  right: Record<
    string,
    string | number
  >;

  type:
    | "warehouse"
    | "product";

  number:
    (
      value: unknown
    ) => string;

  money:
    (
      value: unknown
    ) => string;

  percent:
    (
      value: unknown
    ) => string;
}) {

  const metrics =
    type ===
    "warehouse"
      ? [
          {
            key:
              "total_items",
            label:
              "Total Items",
            format:
              number,
          },

          {
            key:
              "total_stock",
            label:
              "Total Stock",
            format:
              number,
          },

          {
            key:
              "average_daily_demand",
            label:
              "Average Daily Demand",
            format:
              number,
          },

          {
            key:
              "inventory_value",
            label:
              "Inventory Value",
            format:
              money,
          },

          {
            key:
              "excess_stock",
            label:
              "Excess Stock",
            format:
              number,
          },

          {
            key:
              "potential_savings",
            label:
              "Potential Savings",
            format:
              money,
          },

          {
            key:
              "critical_items",
            label:
              "Critical Items",
            format:
              number,
          },
        ]
      : [
          {
            key:
              "records",
            label:
              "Records",
            format:
              number,
          },

          {
            key:
              "stock_level",
            label:
              "Stock Level",
            format:
              number,
          },

          {
            key:
              "daily_demand",
            label:
              "Daily Demand",
            format:
              number,
          },

          {
            key:
              "forecast_7d",
            label:
              "Forecast 7D",
            format:
              number,
          },

          {
            key:
              "stockout_probability",
            label:
              "Stockout Probability",
            format:
              percent,
          },

          {
            key:
              "potential_savings",
            label:
              "Potential Savings",
            format:
              money,
          },
        ];


  return (
    <section className="comparison-entity-grid">

      <article className="dashboard-panel comparison-side-card">

        <span>
          {type ===
          "warehouse"
            ? "WAREHOUSE A"
            : "PRODUCT A"}
        </span>


        <h2>
          {
            left.id
          }
        </h2>


        {metrics.map(
          metric => (

            <ComparisonMetric
              key={
                metric.key
              }

              label={
                metric.label
              }

              value={
                metric.format(
                  left[
                    metric.key
                  ]
                )
              }
            />

          )
        )}

      </article>


      <div className="comparison-center-divider">

        <ArrowRightLeft
          size={22}
        />

        <strong>
          VS
        </strong>

      </div>


      <article className="dashboard-panel comparison-side-card">

        <span>
          {type ===
          "warehouse"
            ? "WAREHOUSE B"
            : "PRODUCT B"}
        </span>


        <h2>
          {
            right.id
          }
        </h2>


        {metrics.map(
          metric => (

            <ComparisonMetric
              key={
                metric.key
              }

              label={
                metric.label
              }

              value={
                metric.format(
                  right[
                    metric.key
                  ]
                )
              }
            />

          )
        )}

      </article>

    </section>
  );
}


// ==========================================================
// METRIC ROW
// ==========================================================

function ComparisonMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="comparison-metric-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}