import {
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  Boxes,
  Download,
  FileText,
  PackageX,
  PiggyBank,
  Printer,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  getExecutiveReport,
  type ReportResponse,
} from "../services/dashboardApi";


export default function ReportsPage() {
  const [
    report,
    setReport,
  ] =
    useState<
      ReportResponse | null
    >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  // ========================================================
  // LOAD REPORT
  // ========================================================

  const loadReport =
    async (
      silent = false
    ) => {

      try {

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }


        setError("");


        const response =
          await getExecutiveReport();


        setReport(
          response
        );


      } catch (err) {

        console.error(
          "Report loading error:",
          err
        );


        setError(
          "Unable to generate the executive report."
        );


      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    };


  useEffect(() => {
    loadReport();
  }, []);


  // ========================================================
  // FORMATTERS
  // ========================================================

  const money =
    (
      value:
        number |
        null |
        undefined
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
          maximumFractionDigits: 0,
        }
      )}`;
    };


  const number =
    (
      value:
        number |
        null |
        undefined
    ) => {

      if (
        value === null ||
        value === undefined
      ) {
        return "—";
      }


      return value.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      );
    };


  const dateTime =
    (
      value:
        string |
        undefined
    ) => {

      if (!value) {
        return "—";
      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return value;
      }


      return date.toLocaleString(
        "en-IN"
      );
    };


  // ========================================================
  // CSV EXPORT
  // ========================================================

  const exportCsv = () => {

    if (!report) {
      return;
    }


    const summary =
      report.executive_summary;


    const rows = [
      [
        "Metric",
        "Value",
      ],

      [
        "Tracked Inventory",
        summary.tracked_inventory_items,
      ],

      [
        "Healthy Items",
        summary.healthy_items,
      ],

      [
        "Low Stock Items",
        summary.low_stock_items,
      ],

      [
        "Critical Items",
        summary.critical_items,
      ],

      [
        "Excess Items",
        summary.excess_items,
      ],

      [
        "Total Inventory Value",
        summary.total_inventory_value,
      ],

      [
        "Potential Savings",
        summary.potential_savings,
      ],

      [
        "Predicted Stockouts",
        summary.predicted_stockouts,
      ],

      [
        "Active Models",
        summary.active_models,
      ],

      [
        "Forecast Records",
        report.demand_forecast.records,
      ],

      [
        "Latest Forecast",
        report.demand_forecast.latest_forecast ?? "",
      ],

      [
        "Average Forecast",
        report.demand_forecast.average_forecast ?? "",
      ],

      [
        "Average Actual",
        report.demand_forecast.average_actual ?? "",
      ],
    ];


    const csv =
      rows
        .map(
          row =>
            row
              .map(
                value =>
                  `"${String(value).replaceAll(
                    '"',
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `scoptima-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );
  };


  // ========================================================
  // PRINT
  // ========================================================

  const printReport = () => {
    window.print();
  };


  const summary =
    report?.executive_summary;


  return (
    <div className="reports-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="reports-header">

        <div>

          <span className="dashboard-eyebrow">
            BUSINESS INTELLIGENCE
          </span>


          <h1>
            Reports
          </h1>


          <p>
            Generate a consolidated executive
            view of demand forecasting,
            inventory health, stockout risk,
            savings opportunities and model
            performance.
          </p>

        </div>


        <div className="reports-actions">


          <button
            type="button"

            className="report-secondary-button"

            onClick={() =>
              loadReport(true)
            }

            disabled={
              refreshing
            }
          >

            <RefreshCw
              size={14}

              className={
                refreshing
                  ? "refresh-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing"
              : "Generate Report"}

          </button>


          <button
            type="button"

            className="report-secondary-button"

            onClick={
              exportCsv
            }

            disabled={
              !report
            }
          >

            <Download
              size={14}
            />

            Export CSV

          </button>


          <button
            type="button"

            className="dashboard-primary-button"

            onClick={
              printReport
            }

            disabled={
              !report
            }
          >

            <Printer
              size={14}
            />

            Print / PDF

          </button>

        </div>

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
          REPORT META
      ================================================== */}

      {report && (

        <section className="report-meta-card">

          <div>

            <FileText
              size={18}
            />

            <div>

              <span>
                REPORT GENERATED
              </span>

              <strong>
                {dateTime(
                  report.generated_at
                )}
              </strong>

            </div>

          </div>


          <div>

            <span>
              Generated For
            </span>

            <strong>
              {
                report
                  .generated_for
                  .full_name
              }
            </strong>

          </div>


          <div>

            <span>
              Role
            </span>

            <strong>
              {
                report
                  .generated_for
                  .role
              }
            </strong>

          </div>

        </section>

      )}


      {/* ==================================================
          EXECUTIVE KPIS
      ================================================== */}

      <section className="report-kpi-grid">


        <article className="report-kpi-card">

          <div className="report-kpi-icon">

            <Boxes
              size={18}
            />

          </div>


          <span>
            TRACKED INVENTORY
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary
                  .tracked_inventory_items
                  .toLocaleString(
                    "en-IN"
                  )
              : "—"}

          </strong>


          <p>
            Total monitored inventory records
          </p>

        </article>


        <article className="report-kpi-card">

          <div className="report-kpi-icon danger">

            <PackageX
              size={18}
            />

          </div>


          <span>
            CRITICAL ITEMS
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary
                  .critical_items
                  .toLocaleString(
                    "en-IN"
                  )
              : "—"}

          </strong>


          <p>
            Inventory requiring attention
          </p>

        </article>


        <article className="report-kpi-card">

          <div className="report-kpi-icon success">

            <PiggyBank
              size={18}
            />

          </div>


          <span>
            POTENTIAL SAVINGS
          </span>


          <strong>

            {loading
              ? "..."
              : money(
                  summary
                    ?.potential_savings
                )}

          </strong>


          <p>
            Holding-cost optimization opportunity
          </p>

        </article>


        <article className="report-kpi-card">

          <div className="report-kpi-icon">

            <BarChart3
              size={18}
            />

          </div>


          <span>
            ACTIVE MODELS
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary
                  .active_models
              : "—"}

          </strong>


          <p>
            Models currently available
          </p>

        </article>

      </section>


      {/* ==================================================
          MAIN REPORT GRID
      ================================================== */}

      <section className="report-section-grid">


        {/* INVENTORY */}

        <article className="dashboard-panel report-section-card">

          <div className="report-section-heading">

            <div className="report-section-icon">

              <Boxes
                size={17}
              />

            </div>


            <div>

              <span>
                INVENTORY
              </span>


              <h3>
                Inventory Health
              </h3>

            </div>

          </div>


          <div className="report-stat-list">


            <div>

              <span>
                Healthy
              </span>

              <strong>
                {summary
                  ?.healthy_items ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Low Stock
              </span>

              <strong>
                {summary
                  ?.low_stock_items ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Critical
              </span>

              <strong>
                {summary
                  ?.critical_items ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Excess
              </span>

              <strong>
                {summary
                  ?.excess_items ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Inventory Value
              </span>

              <strong>
                {money(
                  summary
                    ?.total_inventory_value
                )}
              </strong>

            </div>

          </div>

        </article>


        {/* DEMAND FORECAST */}

        <article className="dashboard-panel report-section-card">

          <div className="report-section-heading">

            <div className="report-section-icon">

              <TrendingUp
                size={17}
              />

            </div>


            <div>

              <span>
                FORECASTING
              </span>


              <h3>
                Demand Summary
              </h3>

            </div>

          </div>


          <div className="report-stat-list">


            <div>

              <span>
                Evaluated Records
              </span>

              <strong>
                {report
                  ?.demand_forecast
                  .records ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Latest Forecast
              </span>

              <strong>
                {number(
                  report
                    ?.demand_forecast
                    .latest_forecast
                )}
              </strong>

            </div>


            <div>

              <span>
                Average Forecast
              </span>

              <strong>
                {number(
                  report
                    ?.demand_forecast
                    .average_forecast
                )}
              </strong>

            </div>


            <div>

              <span>
                Average Actual
              </span>

              <strong>
                {number(
                  report
                    ?.demand_forecast
                    .average_actual
                )}
              </strong>

            </div>

          </div>

        </article>


        {/* STOCKOUT */}

        <article className="dashboard-panel report-section-card">

          <div className="report-section-heading">

            <div className="report-section-icon danger">

              <PackageX
                size={17}
              />

            </div>


            <div>

              <span>
                RISK
              </span>


              <h3>
                Stockout Intelligence
              </h3>

            </div>

          </div>


          <div className="report-stat-list">

            <div>

              <span>
                Predicted Stockouts
              </span>

              <strong>
                {summary
                  ?.predicted_stockouts ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Critical Risk
              </span>

              <strong>
                {report
                  ?.stockout
                  .summary
                  .critical ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                High Risk
              </span>

              <strong>
                {report
                  ?.stockout
                  .summary
                  .high ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Calculated Accuracy
              </span>

              <strong>

                {typeof report
                  ?.stockout
                  .summary
                  .calculated_accuracy ===
                  "number"
                  ? `${(
                      report
                        .stockout
                        .summary
                        .calculated_accuracy *
                      100
                    ).toFixed(
                      2
                    )}%`
                  : "—"}

              </strong>

            </div>

          </div>

        </article>


        {/* SAVINGS */}

        <article className="dashboard-panel report-section-card">

          <div className="report-section-heading">

            <div className="report-section-icon success">

              <PiggyBank
                size={17}
              />

            </div>


            <div>

              <span>
                COST OPTIMIZATION
              </span>


              <h3>
                Savings Opportunity
              </h3>

            </div>

          </div>


          <div className="report-stat-list">


            <div>

              <span>
                Potential Savings
              </span>

              <strong>
                {money(
                  report
                    ?.cost_savings
                    .summary
                    .potential_savings
                )}
              </strong>

            </div>


            <div>

              <span>
                Excess Value
              </span>

              <strong>
                {money(
                  report
                    ?.cost_savings
                    .summary
                    .total_excess_value
                )}
              </strong>

            </div>


            <div>

              <span>
                Holding Cost
              </span>

              <strong>
                {money(
                  report
                    ?.cost_savings
                    .summary
                    .annual_holding_cost
                )}
              </strong>

            </div>


            <div>

              <span>
                Items With Savings
              </span>

              <strong>
                {report
                  ?.cost_savings
                  .summary
                  .items_with_savings ??
                  "—"}
              </strong>

            </div>

          </div>

        </article>

      </section>


      {/* ==================================================
          MODEL PERFORMANCE
      ================================================== */}

      <section className="dashboard-panel report-model-panel">

        <div className="panel-heading">

          <div>

            <span>
              ML PERFORMANCE
            </span>


            <h3>
              Model Status Summary
            </h3>

          </div>

        </div>


        <div className="report-model-grid">

          {report
            ?.model_performance
            ?.models
            ?.map(
              (
                model:
                  any
              ) => (

                <article
                  key={
                    model.key
                  }

                  className="report-model-card"
                >

                  <div>

                    <span>
                      {
                        model.model_type
                      }
                    </span>


                    <strong>
                      {
                        model.task
                      }
                    </strong>

                  </div>


                  <p>
                    {
                      model.name
                    }
                  </p>


                  <span className="model-active-badge">
                    {
                      model.status ??
                      "active"
                    }
                  </span>

                </article>

              )
            )}

        </div>

      </section>

    </div>
  );
}