import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  ShieldCheck,
  TableProperties,
} from "lucide-react";

import {
  getDataQuality,
  type DataQualityDataset,
  type DataQualityResponse,
} from "../services/dashboardApi";


export default function DataQualityPage() {
  const [
    data,
    setData,
  ] =
    useState<
      DataQualityResponse | null
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


  const [
    selectedDataset,
    setSelectedDataset,
  ] =
    useState<string | null>(
      null
    );


  // ========================================================
  // LOAD
  // ========================================================

  const loadData =
    async (
      silent = false
    ) => {

      try {

        if (silent) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }


        setError(
          ""
        );


        const response =
          await getDataQuality();


        setData(
          response
        );


        if (
          !selectedDataset &&
          response.datasets.length
        ) {
          setSelectedDataset(
            response.datasets[0].key
          );
        }


      } catch (err) {

        console.error(
          "Data quality error:",
          err
        );


        setError(
          "Unable to load data quality intelligence."
        );


      } finally {

        setLoading(
          false
        );

        setRefreshing(
          false
        );

      }

    };


  useEffect(() => {
    loadData();
  }, []);


  // ========================================================
  // SELECTED DATASET
  // ========================================================

  const selected =
    useMemo(
      () =>
        data?.datasets.find(
          dataset =>
            dataset.key ===
            selectedDataset
        ) ??
        null,
      [
        data,
        selectedDataset,
      ]
    );


  // ========================================================
  // HELPERS
  // ========================================================

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


  const percent =
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


      return `${value.toFixed(
        2
      )}%`;
    };


  const formatFileSize =
    (
      bytes:
        number
    ) => {

      if (!bytes) {
        return "0 B";
      }


      if (
        bytes <
        1024
      ) {
        return `${bytes} B`;
      }


      if (
        bytes <
        1024 *
        1024
      ) {
        return `${(
          bytes /
          1024
        ).toFixed(1)} KB`;
      }


      return `${(
        bytes /
        (
          1024 *
          1024
        )
      ).toFixed(2)} MB`;
    };


  const formatDate =
    (
      value:
        string |
        null
    ) => {

      if (!value) {
        return "—";
      }


      const date =
        new Date(
          value
        );


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


  const statusClass =
    (
      status:
        string
    ) => {

      switch (
        status
      ) {

        case "Excellent":
          return "excellent";

        case "Good":
          return "good";

        case "Warning":
          return "warning";

        case "Critical":
          return "critical";

        default:
          return "missing";

      }

    };


  const summary =
    data?.summary;


  return (
    <div className="data-quality-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="data-quality-header">

        <div>

          <span className="dashboard-eyebrow">
            DATA GOVERNANCE
          </span>


          <h1>
            Data Quality
          </h1>


          <p>
            Monitor completeness,
            validity, duplication,
            structural quality and
            machine-learning readiness
            across operational datasets.
          </p>

        </div>


        <button
          type="button"

          className="report-secondary-button"

          disabled={
            refreshing
          }

          onClick={() =>
            loadData(
              true
            )
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
            : "Refresh Quality"}

        </button>

      </section>


      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* ==================================================
          SUMMARY KPI
      ================================================== */}

      <section className="data-quality-kpi-grid">


        <article className="data-quality-kpi-card">

          <div className="data-quality-kpi-icon">

            <ShieldCheck
              size={18}
            />

          </div>


          <span>
            OVERALL QUALITY
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? `${summary.overall_quality_score.toFixed(
                  2
                )}%`
              : "—"}

          </strong>


          <p>
            Status:{" "}
            <b>
              {
                summary
                  ?.overall_status ??
                "—"
              }
            </b>
          </p>

        </article>


        <article className="data-quality-kpi-card">

          <div className="data-quality-kpi-icon">

            <Database
              size={18}
            />

          </div>


          <span>
            DATASETS AVAILABLE
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? `${summary.datasets_available}/${summary.datasets_monitored}`
              : "—"}

          </strong>


          <p>
            Operational datasets monitored
          </p>

        </article>


        <article className="data-quality-kpi-card">

          <div className="data-quality-kpi-icon warning">

            <AlertTriangle
              size={18}
            />

          </div>


          <span>
            MISSING VALUES
          </span>


          <strong>

            {loading
              ? "..."
              : number(
                  summary
                    ?.missing_values
                )}

          </strong>


          <p>
            Across monitored datasets
          </p>

        </article>


        <article className="data-quality-kpi-card">

          <div className="data-quality-kpi-icon success">

            <CheckCircle2
              size={18}
            />

          </div>


          <span>
            ML READY
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? `${summary.ml_ready_datasets}/${summary.datasets_available}`
              : "—"}

          </strong>


          <p>
            Datasets passing quality rules
          </p>

        </article>

      </section>


      {/* ==================================================
          GLOBAL ISSUE SUMMARY
      ================================================== */}

      <section className="dashboard-panel data-quality-global-panel">

        <div className="panel-heading">

          <div>

            <span>
              QUALITY SIGNALS
            </span>


            <h3>
              Data Health Overview
            </h3>

          </div>

        </div>


        <div className="data-quality-health-grid">


          <div>

            <span>
              Total Rows
            </span>

            <strong>
              {number(
                summary
                  ?.total_rows
              )}
            </strong>

          </div>


          <div>

            <span>
              Total Cells
            </span>

            <strong>
              {number(
                summary
                  ?.total_cells
              )}
            </strong>

          </div>


          <div>

            <span>
              Duplicate Rows
            </span>

            <strong>
              {number(
                summary
                  ?.duplicate_rows
              )}
            </strong>

          </div>


          <div>

            <span>
              Negative Values
            </span>

            <strong>
              {number(
                summary
                  ?.negative_values
              )}
            </strong>

          </div>


          <div>

            <span>
              Invalid Numeric
            </span>

            <strong>
              {number(
                summary
                  ?.invalid_numeric_values
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* ==================================================
          DATASET CARDS
      ================================================== */}

      <section className="data-quality-dataset-grid">

        {data?.datasets.map(
          (
            dataset:
              DataQualityDataset
          ) => (

            <button
              key={
                dataset.key
              }

              type="button"

              className={`data-quality-dataset-card ${
                selectedDataset ===
                dataset.key
                  ? "selected"
                  : ""
              }`}

              onClick={() =>
                setSelectedDataset(
                  dataset.key
                )
              }
            >

              <div className="dataset-quality-card-header">

                <div className="dataset-quality-icon">

                  <TableProperties
                    size={16}
                  />

                </div>


                <div>

                  <strong>
                    {
                      dataset.name
                    }
                  </strong>

                  <span>
                    {
                      dataset.path
                    }
                  </span>

                </div>


                <span
                  className={`data-quality-status ${statusClass(
                    dataset.status
                  )}`}
                >
                  {
                    dataset.status
                  }
                </span>

              </div>


              <div className="dataset-quality-score">

                <strong>
                  {dataset.quality_score.toFixed(
                    1
                  )}
                </strong>

                <span>
                  / 100
                </span>

              </div>


              <div className="dataset-quality-progress">

                <span
                  style={{
                    width:
                      `${Math.min(
                        dataset.quality_score,
                        100
                      )}%`,
                  }}
                />

              </div>


              <div className="dataset-quality-mini-grid">


                <div>

                  <span>
                    Rows
                  </span>

                  <strong>
                    {number(
                      dataset.rows
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Columns
                  </span>

                  <strong>
                    {
                      dataset.columns
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Missing
                  </span>

                  <strong>
                    {
                      dataset
                        .missing_values
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Duplicates
                  </span>

                  <strong>
                    {
                      dataset
                        .duplicate_rows
                    }
                  </strong>

                </div>

              </div>


              <div
                className={`dataset-ml-ready ${
                  dataset.ml_ready
                    ? "ready"
                    : "not-ready"
                }`}
              >

                {dataset.ml_ready
                  ? "ML READY"
                  : "REVIEW REQUIRED"}

              </div>

            </button>

          )
        )}

      </section>


      {/* ==================================================
          SELECTED DATASET DETAIL
      ================================================== */}

      {selected && (

        <>

          <section className="data-quality-detail-grid">


            {/* SCORES */}

            <article className="dashboard-panel">

              <div className="panel-heading">

                <div>

                  <span>
                    DATASET QUALITY
                  </span>


                  <h3>
                    {selected.name}
                  </h3>

                </div>

              </div>


              <div className="quality-score-list">


                <div>

                  <div>

                    <span>
                      Completeness
                    </span>

                    <strong>
                      {percent(
                        selected
                          .completeness_score
                      )}
                    </strong>

                  </div>


                  <div className="quality-score-track">

                    <span
                      style={{
                        width:
                          `${selected.completeness_score}%`,
                      }}
                    />

                  </div>

                </div>


                <div>

                  <div>

                    <span>
                      Uniqueness
                    </span>

                    <strong>
                      {percent(
                        selected
                          .uniqueness_score
                      )}
                    </strong>

                  </div>


                  <div className="quality-score-track">

                    <span
                      style={{
                        width:
                          `${selected.uniqueness_score}%`,
                      }}
                    />

                  </div>

                </div>


                <div>

                  <div>

                    <span>
                      Validity
                    </span>

                    <strong>
                      {percent(
                        selected
                          .validity_score
                      )}
                    </strong>

                  </div>


                  <div className="quality-score-track">

                    <span
                      style={{
                        width:
                          `${selected.validity_score}%`,
                      }}
                    />

                  </div>

                </div>

              </div>


              <div className="dataset-metadata-list">


                <div>

                  <span>
                    File Size
                  </span>

                  <strong>
                    {formatFileSize(
                      selected
                        .file_size_bytes
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Last Modified
                  </span>

                  <strong>
                    {formatDate(
                      selected
                        .last_modified
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Missing %
                  </span>

                  <strong>
                    {percent(
                      selected
                        .missing_percentage
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Duplicate %
                  </span>

                  <strong>
                    {percent(
                      selected
                        .duplicate_percentage
                    )}
                  </strong>

                </div>

              </div>

            </article>


            {/* ISSUES */}

            <article className="dashboard-panel">

              <div className="panel-heading">

                <div>

                  <span>
                    QUALITY REVIEW
                  </span>


                  <h3>
                    Detected Issues
                  </h3>

                </div>

              </div>


              <div className="data-quality-issues">

                {selected.issues.map(
                  (
                    issue,
                    index
                  ) => (

                    <div
                      key={
                        `${issue}-${index}`
                      }

                      className={
                        selected.issues.length ===
                          1 &&
                        issue.includes(
                          "No major"
                        )
                          ? "quality-issue-row success"
                          : "quality-issue-row warning"
                      }
                    >

                      {selected.issues.length ===
                        1 &&
                      issue.includes(
                        "No major"
                      )
                        ? (
                          <CheckCircle2
                            size={15}
                          />
                        )
                        : (
                          <AlertTriangle
                            size={15}
                          />
                        )}


                      <span>
                        {issue}
                      </span>

                    </div>

                  )
                )}

              </div>

            </article>

          </section>


          {/* =================================================
              COLUMN QUALITY TABLE
          ================================================= */}

          <section className="dashboard-panel data-quality-table-panel">

            <div className="panel-heading">

              <div>

                <span>
                  SCHEMA QUALITY
                </span>


                <h3>
                  Column Analysis
                </h3>

              </div>

            </div>


            <div className="data-quality-table-wrapper">

              <table className="data-quality-table">

                <thead>

                  <tr>

                    <th>
                      Column
                    </th>

                    <th>
                      Data Type
                    </th>

                    <th>
                      Missing
                    </th>

                    <th>
                      Missing %
                    </th>

                    <th>
                      Unique Values
                    </th>

                    <th>
                      Health
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {selected
                    .column_quality
                    .map(
                      (
                        column
                      ) => (

                        <tr
                          key={
                            column.column
                          }
                        >

                          <td className="data-column-name">
                            {
                              column.column
                            }
                          </td>


                          <td>
                            {
                              column.dtype
                            }
                          </td>


                          <td>
                            {
                              column
                                .missing_values
                            }
                          </td>


                          <td>
                            {percent(
                              column
                                .missing_percentage
                            )}
                          </td>


                          <td>
                            {
                              column
                                .unique_values
                                .toLocaleString(
                                  "en-IN"
                                )
                            }
                          </td>


                          <td>

                            <span
                              className={
                                column.missing_percentage ===
                                0
                                  ? "column-health-badge healthy"
                                  : column.missing_percentage <
                                    10
                                  ? "column-health-badge warning"
                                  : "column-health-badge critical"
                              }
                            >

                              {column.missing_percentage ===
                              0
                                ? "Healthy"
                                : column.missing_percentage <
                                  10
                                ? "Review"
                                : "Poor"}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

        </>

      )}

    </div>
  );
}