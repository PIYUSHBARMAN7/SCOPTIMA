import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Gauge,
  Layers3,
  Target,
} from "lucide-react";

import {
  getModelPerformance,
  type ModelPerformanceItem,
  type ModelPerformanceResponse,
} from "../services/dashboardApi";


export default function ModelPerformancePage() {
  const [
    data,
    setData,
  ] =
    useState<
      ModelPerformanceResponse | null
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


  // ========================================================
  // LOAD
  // ========================================================

  useEffect(() => {
    const load =
      async () => {

        try {

          setLoading(
            true
          );


          setError(
            ""
          );


          const response =
            await getModelPerformance();


          setData(
            response
          );


        } catch (err) {

          console.error(
            "Model performance error:",
            err
          );


          setError(
            "Unable to load model performance."
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    load();

  }, []);


  // ========================================================
  // FORMAT
  // ========================================================

  const metric =
    (
      value:
        number |
        null |
        undefined,
      decimals = 4,
    ) => {

      if (
        value === null ||
        value === undefined
      ) {
        return "—";
      }


      return value.toFixed(
        decimals
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


      return `${(
        value *
        100
      ).toFixed(
        2
      )}%`;
    };


  const summary =
    data?.summary;


  return (
    <div className="model-performance-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="model-performance-header">

        <div>

          <span className="dashboard-eyebrow">
            ML GOVERNANCE
          </span>


          <h1>
            Model Performance
          </h1>


          <p>
            Monitor deployed model status,
            verified evaluation metrics and
            benchmark performance across the
            SCOPTIMA decision engine.
          </p>

        </div>

      </section>


      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <section className="model-performance-kpi-grid">


        <article className="model-performance-kpi-card">

          <div className="model-performance-kpi-icon">

            <BrainCircuit
              size={18}
            />

          </div>


          <span>
            DEPLOYED MODELS
          </span>


          <strong>

            {loading
              ? "..."
              : summary?.total_models ??
                "—"}

          </strong>


          <p>
            Models integrated with SCOPTIMA
          </p>

        </article>


        <article className="model-performance-kpi-card">

          <div className="model-performance-kpi-icon active">

            <CheckCircle2
              size={18}
            />

          </div>


          <span>
            ACTIVE MODELS
          </span>


          <strong>

            {loading
              ? "..."
              : summary?.active_models ??
                "—"}

          </strong>


          <p>
            Available for platform inference
          </p>

        </article>


        <article className="model-performance-kpi-card">

          <div className="model-performance-kpi-icon">

            <Target
              size={18}
            />

          </div>


          <span>
            STOCKOUT ACCURACY
          </span>


          <strong>

            {loading
              ? "..."
              : percent(
                  summary
                    ?.stockout_accuracy
                )}

          </strong>


          <p>
            CatBoost classifier evaluation
          </p>

        </article>


        <article className="model-performance-kpi-card">

          <div className="model-performance-kpi-icon">

            <Gauge
              size={18}
            />

          </div>


          <span>
            LOGISTICS R²
          </span>


          <strong>

            {loading
              ? "..."
              : metric(
                  summary
                    ?.logistics_r2,
                  4,
                )}

          </strong>


          <p>
            KPI estimator goodness of fit
          </p>

        </article>

      </section>


      {/* ==================================================
          MODEL CARDS
      ================================================== */}

      <section className="model-performance-card-grid">

        {data?.models.map(
          (
            model:
              ModelPerformanceItem
          ) => (

            <article
              className="dashboard-panel model-performance-card"

              key={
                model.key
              }
            >

              <div className="model-performance-card-header">


                <div className="model-performance-card-icon">

                  {model.model_type ===
                  "Classification"
                    ? (
                      <Target
                        size={19}
                      />
                    )
                    : (
                      <Activity
                        size={19}
                      />
                    )}

                </div>


                <div>

                  <span>
                    {
                      model.model_type
                    }
                  </span>


                  <h3>
                    {
                      model.task
                    }
                  </h3>


                  <p>
                    {
                      model.name
                    }
                  </p>

                </div>


                <span className="model-active-badge">
                  ACTIVE
                </span>

              </div>


              <p className="model-performance-description">
                {
                  model.description
                }
              </p>


              <div className="model-performance-metric-grid">


                {model.metrics.mae !==
                  null && (

                  <div>

                    <span>
                      MAE
                    </span>

                    <strong>
                      {metric(
                        model
                          .metrics
                          .mae
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.rmse !==
                  null && (

                  <div>

                    <span>
                      RMSE
                    </span>

                    <strong>
                      {metric(
                        model
                          .metrics
                          .rmse
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.r2 !==
                  null && (

                  <div>

                    <span>
                      R²
                    </span>

                    <strong>
                      {metric(
                        model
                          .metrics
                          .r2
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.accuracy !==
                  null && (

                  <div>

                    <span>
                      Accuracy
                    </span>

                    <strong>
                      {percent(
                        model
                          .metrics
                          .accuracy
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.precision !==
                  null && (

                  <div>

                    <span>
                      Precision
                    </span>

                    <strong>
                      {percent(
                        model
                          .metrics
                          .precision
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.recall !==
                  null && (

                  <div>

                    <span>
                      Recall
                    </span>

                    <strong>
                      {percent(
                        model
                          .metrics
                          .recall
                      )}
                    </strong>

                  </div>

                )}


                {model.metrics.f1 !==
                  null && (

                  <div>

                    <span>
                      F1
                    </span>

                    <strong>
                      {percent(
                        model
                          .metrics
                          .f1
                      )}
                    </strong>

                  </div>

                )}

              </div>


              {/* RETAIL BENCHMARK */}

              {model.benchmark && (

                <div className="model-benchmark-card">

                  <div>

                    <Layers3
                      size={15}
                    />


                    <strong>
                      {
                        model
                          .benchmark
                          .name
                      }
                    </strong>

                  </div>


                  <p>
                    Historical training benchmark.
                    It is shown separately from the
                    currently deployed retail artifact.
                  </p>


                  <div className="model-benchmark-metrics">

                    <span>
                      MAE

                      <strong>
                        {metric(
                          model
                            .benchmark
                            .mae
                        )}
                      </strong>
                    </span>


                    <span>
                      RMSE

                      <strong>
                        {metric(
                          model
                            .benchmark
                            .rmse
                        )}
                      </strong>
                    </span>


                    <span>
                      R²

                      <strong>
                        {metric(
                          model
                            .benchmark
                            .r2
                        )}
                      </strong>
                    </span>


                    <span>
                      WAPE

                      <strong>
                        {
                          model
                            .benchmark
                            .wape
                            .toFixed(
                              2
                            )
                        }%
                      </strong>
                    </span>


                    <span>
                      Accuracy

                      <strong>
                        {
                          model
                            .benchmark
                            .forecast_accuracy
                            .toFixed(
                              2
                            )
                        }%
                      </strong>
                    </span>

                  </div>

                </div>

              )}


              <div className="model-performance-source">

                <span>
                  Metric source
                </span>


                <strong>
                  {
                    model.metric_source
                  }
                </strong>

              </div>

            </article>

          )
        )}

      </section>


      {/* ==================================================
          COMPARISON TABLE
      ================================================== */}

      <section className="dashboard-panel model-comparison-panel">

        <div className="panel-heading">

          <div>

            <span>
              MODEL REGISTRY
            </span>


            <h3>
              Deployed Model Comparison
            </h3>

          </div>

        </div>


        <div className="model-comparison-table-wrapper">

          <table className="model-comparison-table">

            <thead>

              <tr>

                <th>
                  Model
                </th>

                <th>
                  Task
                </th>

                <th>
                  Type
                </th>

                <th>
                  MAE
                </th>

                <th>
                  RMSE
                </th>

                <th>
                  R²
                </th>

                <th>
                  Accuracy
                </th>

                <th>
                  Precision
                </th>

                <th>
                  Recall
                </th>

                <th>
                  F1
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {data?.models.map(
                (
                  model
                ) => (

                  <tr
                    key={
                      model.key
                    }
                  >

                    <td className="model-name-cell">
                      {
                        model.name
                      }
                    </td>


                    <td>
                      {
                        model.task
                      }
                    </td>


                    <td>
                      {
                        model.model_type
                      }
                    </td>


                    <td>
                      {metric(
                        model
                          .metrics
                          .mae
                      )}
                    </td>


                    <td>
                      {metric(
                        model
                          .metrics
                          .rmse
                      )}
                    </td>


                    <td>
                      {metric(
                        model
                          .metrics
                          .r2
                      )}
                    </td>


                    <td>
                      {percent(
                        model
                          .metrics
                          .accuracy
                      )}
                    </td>


                    <td>
                      {percent(
                        model
                          .metrics
                          .precision
                      )}
                    </td>


                    <td>
                      {percent(
                        model
                          .metrics
                          .recall
                      )}
                    </td>


                    <td>
                      {percent(
                        model
                          .metrics
                          .f1
                      )}
                    </td>


                    <td>

                      <span className="model-active-badge">
                        ACTIVE
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}