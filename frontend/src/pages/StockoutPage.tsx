import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  PackageX,
  ShieldAlert,
  Target,
  XCircle,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getStockoutRisk,
  type StockoutRiskRecord,
  type StockoutRiskResponse,
} from "../services/dashboardApi";


export default function StockoutPage() {
  const {
    user,
  } = useAuth();


  const navigate =
    useNavigate();


  const [
    data,
    setData,
  ] =
    useState<
      StockoutRiskResponse | null
    >(null);


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


  const [
    riskFilter,
    setRiskFilter,
  ] =
    useState("All");


  const [
    resultFilter,
    setResultFilter,
  ] =
    useState("All");


  const [
    search,
    setSearch,
  ] =
    useState("");


  // ========================================================
  // LOAD
  // ========================================================

  useEffect(() => {
    const loadStockoutData =
      async () => {

        try {

          setLoading(
            true
          );


          setError(
            ""
          );


          const response =
            await getStockoutRisk();


          setData(
            response
          );


        } catch (err) {

          console.error(
            "Stockout page error:",
            err
          );


          setError(
            "Unable to load stockout risk intelligence."
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    loadStockoutData();

  }, []);


  // ========================================================
  // HELPERS
  // ========================================================

  const percentage =
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


      return `${(
        value *
        100
      ).toFixed(
        2
      )}%`;
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
          maximumFractionDigits:
            2,
        }
      );
    };


  const riskClass =
    (
      risk:
        string
    ) => {

      switch (
        risk
      ) {

        case "Critical":
          return "critical";

        case "High":
          return "high";

        case "Medium":
          return "medium";

        default:
          return "low";

      }

    };


  // ========================================================
  // FILTERED TABLE
  // ========================================================

  const filteredRecords =
    useMemo(
      () => {

        const records =
          data?.records ??
          [];


        const searchTerm =
          search
            .trim()
            .toLowerCase();


        return records.filter(
          (
            record
          ) => {

            const riskMatches =
              riskFilter ===
                "All" ||
              record.risk_level ===
                riskFilter;


            const resultMatches =
              resultFilter ===
                "All" ||
              (
                resultFilter ===
                  "Correct" &&
                record.prediction_correct
              ) ||
              (
                resultFilter ===
                  "Incorrect" &&
                !record.prediction_correct
              );


            if (
              !searchTerm
            ) {
              return (
                riskMatches &&
                resultMatches
              );
            }


            const searchable =
              [
                record.item_id,
                record.category,
                record.storage_location_id,
                record.zone,
                record.risk_level,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase();


            return (
              riskMatches &&
              resultMatches &&
              searchable.includes(
                searchTerm
              )
            );

          }
        );

      },
      [
        data,
        riskFilter,
        resultFilter,
        search,
      ]
    );


  const summary =
    data?.summary;


  return (
    <div className="stockout-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="stockout-page-header">

        <div>

          <span className="dashboard-eyebrow">
            RISK INTELLIGENCE
          </span>


          <h1>
            Stockout Risk
          </h1>


          <p>
            Compare actual and predicted
            stockout outcomes, review
            probability and confidence,
            and prioritize replenishment.
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
            Run Risk Analysis
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
          KPI GRID
      ================================================== */}

      <section className="stockout-kpi-grid">


        <article className="stockout-kpi-card">

          <div className="stockout-kpi-icon danger">

            <PackageX
              size={18}
            />

          </div>


          <span>
            ACTUAL STOCKOUTS
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary
                  .actual_stockouts
                  .toLocaleString(
                    "en-IN"
                  )
              : "—"}

          </strong>


          <p>
            Observed stockout outcomes
          </p>

        </article>


        <article className="stockout-kpi-card">

          <div className="stockout-kpi-icon critical">

            <ShieldAlert
              size={18}
            />

          </div>


          <span>
            PREDICTED STOCKOUTS
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary
                  .predicted_stockouts
                  .toLocaleString(
                    "en-IN"
                  )
              : "—"}

          </strong>


          <p>
            CatBoost predicted risk
          </p>

        </article>


        <article className="stockout-kpi-card">

          <div className="stockout-kpi-icon model">

            <BrainCircuit
              size={18}
            />

          </div>


          <span>
            CALCULATED ACCURACY
          </span>


          <strong>

            {loading
              ? "..."
              : percentage(
                  summary
                    ?.calculated_accuracy
                )}

          </strong>


          <p>
            Actual vs predicted records
          </p>

        </article>


        <article className="stockout-kpi-card">

          <div className="stockout-kpi-icon">

            <Target
              size={18}
            />

          </div>


          <span>
            AVG. CONFIDENCE
          </span>


          <strong>

            {loading
              ? "..."
              : percentage(
                  summary
                    ?.average_confidence
                )}

          </strong>


          <p>
            Across saved predictions
          </p>

        </article>

      </section>


      {/* ==================================================
          CONFUSION MATRIX + RISK
      ================================================== */}

      <section className="stockout-secondary-grid">


        {/* CONFUSION MATRIX */}

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                CLASSIFICATION QUALITY
              </span>


              <h3>
                Confusion Matrix
              </h3>

            </div>

          </div>


          <div className="stockout-confusion-grid">


            <div className="stockout-confusion-card success">

              <span>
                True Positive
              </span>

              <strong>
                {summary
                  ?.true_positive ??
                  "—"}
              </strong>

              <p>
                Correctly predicted stockout
              </p>

            </div>


            <div className="stockout-confusion-card success">

              <span>
                True Negative
              </span>

              <strong>
                {summary
                  ?.true_negative ??
                  "—"}
              </strong>

              <p>
                Correctly predicted no stockout
              </p>

            </div>


            <div className="stockout-confusion-card danger">

              <span>
                False Positive
              </span>

              <strong>
                {summary
                  ?.false_positive ??
                  "—"}
              </strong>

              <p>
                False stockout warning
              </p>

            </div>


            <div className="stockout-confusion-card danger">

              <span>
                False Negative
              </span>

              <strong>
                {summary
                  ?.false_negative ??
                  "—"}
              </strong>

              <p>
                Missed stockout event
              </p>

            </div>

          </div>

        </article>


        {/* PERFORMANCE */}

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                MODEL QUALITY
              </span>


              <h3>
                Classifier Performance
              </h3>

            </div>


            <span className="model-active-badge">
              ACTIVE
            </span>

          </div>


          <div className="stockout-model-metrics">


            <div>

              <span>
                Accuracy
              </span>

              <strong>
                {percentage(
                  summary
                    ?.model_accuracy
                )}
              </strong>

            </div>


            <div>

              <span>
                Precision
              </span>

              <strong>
                {percentage(
                  summary
                    ?.model_precision
                )}
              </strong>

            </div>


            <div>

              <span>
                Recall
              </span>

              <strong>
                {percentage(
                  summary
                    ?.model_recall
                )}
              </strong>

            </div>


            <div>

              <span>
                F1 Score
              </span>

              <strong>
                {percentage(
                  summary
                    ?.model_f1
                )}
              </strong>

            </div>

          </div>


          <div className="stockout-risk-distribution">

            <div className="stockout-risk-box critical">

              <span>
                Critical
              </span>

              <strong>
                {summary?.critical ??
                  "—"}
              </strong>

            </div>


            <div className="stockout-risk-box high">

              <span>
                High
              </span>

              <strong>
                {summary?.high ??
                  "—"}
              </strong>

            </div>


            <div className="stockout-risk-box medium">

              <span>
                Medium
              </span>

              <strong>
                {summary?.medium ??
                  "—"}
              </strong>

            </div>


            <div className="stockout-risk-box low">

              <span>
                Low
              </span>

              <strong>
                {summary?.low ??
                  "—"}
              </strong>

            </div>

          </div>

        </article>

      </section>


      {/* ==================================================
          TABLE
      ================================================== */}

      <section className="dashboard-panel stockout-table-panel">


        <div className="stockout-table-header">

          <div>

            <span className="dashboard-eyebrow">
              PREDICTION AUDIT
            </span>


            <h3>
              Actual vs Predicted Risk
            </h3>

          </div>


          <div className="stockout-table-controls">


            <input
              type="text"

              value={
                search
              }

              placeholder="Search category, location, zone..."

              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />


            <select
              value={
                riskFilter
              }

              onChange={(
                event
              ) =>
                setRiskFilter(
                  event.target
                    .value
                )
              }
            >

              <option value="All">
                All Risk
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

            </select>


            <select
              value={
                resultFilter
              }

              onChange={(
                event
              ) =>
                setResultFilter(
                  event.target
                    .value
                )
              }
            >

              <option value="All">
                All Results
              </option>

              <option value="Correct">
                Correct
              </option>

              <option value="Incorrect">
                Incorrect
              </option>

            </select>

          </div>

        </div>


        <div className="stockout-table-wrapper">

          <table className="stockout-risk-table">

            <thead>

              <tr>

                <th>
                  Item
                </th>

                <th>
                  Category
                </th>

                <th>
                  Location
                </th>

                <th>
                  Zone
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Safety Stock
                </th>

                <th>
                  Optimized ROP
                </th>

                <th>
                  Actual
                </th>

                <th>
                  Predicted
                </th>

                <th>
                  Probability
                </th>

                <th>
                  Confidence
                </th>

                <th>
                  Result
                </th>

                <th>
                  Risk
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRecords.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={
                      13
                    }

                    className="stockout-empty-row"
                  >
                    No records match the current filters.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record:
                      StockoutRiskRecord
                  ) => (

                    <tr
                      key={
                        record.row_id
                      }
                    >

                      <td>
                        {record.item_id ??
                          `#${record.row_id}`}
                      </td>


                      <td>
                        {record.category ??
                          "—"}
                      </td>


                      <td>
                        {record.storage_location_id ??
                          "—"}
                      </td>


                      <td>
                        {record.zone ??
                          "—"}
                      </td>


                      <td>
                        {number(
                          record.stock_level
                        )}
                      </td>


                      <td>
                        {number(
                          record.safety_stock
                        )}
                      </td>


                      <td>
                        {number(
                          record.optimized_reorder_point
                        )}
                      </td>


                      {/* ACTUAL */}

                      <td>

                        <span
                          className={
                            record.actual_stockout_risk ===
                            1
                              ? "stockout-binary-badge risk"
                              : "stockout-binary-badge safe"
                          }
                        >

                          {record.actual_stockout_risk ===
                          1
                            ? "STOCKOUT"
                            : "SAFE"}

                        </span>

                      </td>


                      {/* PREDICTED */}

                      <td>

                        <span
                          className={
                            record.predicted_stockout_risk ===
                            1
                              ? "stockout-binary-badge risk"
                              : "stockout-binary-badge safe"
                          }
                        >

                          {record.predicted_stockout_risk ===
                          1
                            ? "STOCKOUT"
                            : "SAFE"}

                        </span>

                      </td>


                      {/* PROBABILITY */}

                      <td>

                        <div className="stockout-probability-cell">

                          <strong>
                            {percentage(
                              record.stockout_probability
                            )}
                          </strong>


                          <div>

                            <span
                              style={{
                                width:
                                  `${
                                    record.stockout_probability *
                                    100
                                  }%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      <td>
                        {percentage(
                          record.confidence
                        )}
                      </td>


                      {/* CORRECT / INCORRECT */}

                      <td>

                        <span
                          className={
                            record.prediction_correct
                              ? "stockout-result-badge correct"
                              : "stockout-result-badge incorrect"
                          }
                        >

                          {record.prediction_correct
                            ? (
                              <>
                                <CheckCircle2
                                  size={12}
                                />

                                Correct
                              </>
                            )
                            : (
                              <>
                                <XCircle
                                  size={12}
                                />

                                Incorrect
                              </>
                            )}

                        </span>

                      </td>


                      <td>

                        <span
                          className={`stockout-risk-badge ${riskClass(
                            record.risk_level
                          )}`}
                        >
                          {
                            record.risk_level
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}