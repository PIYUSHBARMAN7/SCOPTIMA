import {
  useEffect,
  useMemo,
  useState,
} from "react";


type ModelKey =
  | "supply_chain"
  | "retail"
  | "logistics_kpi"
  | "stockout";


type InputMode =
  | "manual"
  | "csv";


type ModelRequirement = {
  target: string;
  model?: string;
  features: string[];
  categorical_features: string[];
};


type RequirementsResponse = {
  supply_chain: ModelRequirement;
  retail: ModelRequirement;
  logistics_kpi: ModelRequirement;
  stockout: ModelRequirement;
};


type PredictionResult = {
  model?: string;

  prediction_type?: string;

  prediction?: number | string;

  confidence?: number | null;

  stockout_probability?: number | null;

  source?: string;

  record?: {
    sku_id?: string;
    warehouse_id?: string;

    store_id?: string;
    product_id?: string;

    item_id?: string;
    storage_location_id?: string;
    zone?: string;

    category?: string;
    region?: string;

    date?: string;
  };

  generated_features?: Record<
    string,
    number
  >;
};


const API_BASE =
  "http://localhost:8000";


const modelOptions: {
  value: ModelKey;
  label: string;
  endpoint: string;
}[] = [
  {
    value: "supply_chain",
    label: "Supply Chain Forecast",
    endpoint:
      "/api/predictions/supply-chain",
  },

  {
    value: "retail",
    label: "Retail Demand Forecast",
    endpoint:
      "/api/predictions/retail",
  },

  {
    value: "logistics_kpi",
    label: "Logistics KPI Estimator",
    endpoint:
      "/api/predictions/logistics-kpi",
  },

  {
    value: "stockout",
    label: "Stockout Risk",
    endpoint:
      "/api/predictions/stockout",
  },
];


export default function RunAnalysisPage() {
  const [
    selectedModel,
    setSelectedModel,
  ] =
    useState<ModelKey>(
      "supply_chain"
    );


  const [
    inputMode,
    setInputMode,
  ] =
    useState<InputMode>(
      "manual"
    );


  const [
    requirements,
    setRequirements,
  ] =
    useState<
      RequirementsResponse | null
    >(null);


  const [
    formData,
    setFormData,
  ] =
    useState<
      Record<string, string>
    >({});


  const [
    csvFile,
    setCsvFile,
  ] =
    useState<File | null>(
      null
    );


  const [
    loadingRequirements,
    setLoadingRequirements,
  ] =
    useState(true);


  const [
    running,
    setRunning,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    result,
    setResult,
  ] =
    useState<
      PredictionResult | null
    >(null);


  const selectedConfig =
    useMemo(
      () =>
        modelOptions.find(
          (item) =>
            item.value ===
            selectedModel
        )!,
      [selectedModel]
    );


  const selectedRequirement =
    requirements?.[
      selectedModel
    ];


  // ========================================================
  // LOAD REQUIREMENTS
  // ========================================================

  useEffect(() => {
    const loadRequirements =
      async () => {
        try {
          setLoadingRequirements(
            true
          );

          setError("");

          const response =
            await fetch(
              `${API_BASE}/api/predictions/requirements`,
              {
                method: "GET",
                credentials:
                  "include",
              }
            );

          const data =
            await response.json();


          if (!response.ok) {
            throw new Error(
              data?.detail ||
                "Unable to load model requirements."
            );
          }


          setRequirements(
            data
          );
        } catch (err) {
          if (
            err instanceof Error
          ) {
            setError(
              err.message
            );
          } else {
            setError(
              "Unable to load model requirements."
            );
          }
        } finally {
          setLoadingRequirements(
            false
          );
        }
      };


    loadRequirements();
  }, []);


  // ========================================================
  // RESET FORM WHEN MODEL CHANGES
  // ========================================================

  useEffect(() => {
    if (
      !selectedRequirement
    ) {
      return;
    }


    const initialData:
      Record<
        string,
        string
      > = {};


    selectedRequirement.features.forEach(
      (feature) => {
        initialData[
          feature
        ] = "";
      }
    );


    setFormData(
      initialData
    );

    setCsvFile(
      null
    );

    setResult(
      null
    );

    setError(
      ""
    );
  }, [
    selectedModel,
    selectedRequirement,
  ]);


  // ========================================================
  // INPUT CHANGE
  // ========================================================

  const handleInputChange =
    (
      feature: string,
      value: string
    ) => {
      setFormData(
        (previous) => ({
          ...previous,
          [feature]:
            value,
        })
      );
    };


  // ========================================================
  // CATEGORICAL CHECK
  // ========================================================

  const isCategorical =
    (
      feature: string
    ) => {
      return (
        selectedRequirement
          ?.categorical_features
          ?.includes(
            feature
          ) ?? false
      );
    };


  // ========================================================
  // MIN VALUES
  // ========================================================

  const getFieldMin =
    (
      feature: string
    ) => {
      const nonNegative =
        [
          "lag_1",
          "lag_7",
          "rolling_mean_7",
          "rolling_std_7",
          "rolling_mean_14",

          "stock_level",
          "reorder_point",
          "reorder_frequency_days",
          "lead_time_days",
          "daily_demand",
          "demand_std_dev",
          "item_popularity_score",
          "picking_time_seconds",
          "handling_cost_per_unit",
          "unit_price",
          "holding_cost_per_unit_day",
          "stockout_count_last_month",
          "order_fulfillment_rate",
          "total_orders_last_month",
          "turnover_ratio",
          "layout_efficiency_score",
          "forecasted_demand_next_7d",
          "inventory_value",
          "annual_holding_cost",
          "lead_time_demand",
          "safety_stock",
          "optimized_reorder_point",
          "days_of_inventory",
        ];


      if (
        nonNegative.includes(
          feature
        )
      ) {
        return 0;
      }


      if (
        feature === "month" ||
        feature === "Month" ||
        feature === "restock_month"
      ) {
        return 1;
      }


      if (
        feature === "day_of_month" ||
        feature === "DayOfMonth"
      ) {
        return 1;
      }


      if (
        feature === "day_of_week" ||
        feature === "DayOfWeek" ||
        feature === "restock_dayofweek"
      ) {
        return 0;
      }


      if (
        feature === "promotion_flag" ||
        feature === "Promotion_Flag" ||
        feature === "Holiday/Promotion" ||
        feature === "IsWeekend"
      ) {
        return 0;
      }


      if (
        feature === "restock_quarter"
      ) {
        return 1;
      }


      return undefined;
    };


  // ========================================================
  // MAX VALUES
  // ========================================================

  const getFieldMax =
    (
      feature: string
    ) => {
      if (
        feature === "month" ||
        feature === "Month" ||
        feature === "restock_month"
      ) {
        return 12;
      }


      if (
        feature === "day_of_month" ||
        feature === "DayOfMonth"
      ) {
        return 31;
      }


      if (
        feature === "day_of_week" ||
        feature === "DayOfWeek" ||
        feature === "restock_dayofweek"
      ) {
        return 6;
      }


      if (
        feature === "promotion_flag" ||
        feature === "Promotion_Flag" ||
        feature === "Holiday/Promotion" ||
        feature === "IsWeekend"
      ) {
        return 1;
      }


      if (
        feature === "restock_quarter"
      ) {
        return 4;
      }


      return undefined;
    };


  // ========================================================
  // FIELD VALIDATION
  // ========================================================

  const validateField =
    (
      feature: string,
      value: number
    ) => {
      const min =
        getFieldMin(
          feature
        );

      const max =
        getFieldMax(
          feature
        );


      if (
        min !== undefined &&
        value < min
      ) {
        throw new Error(
          `${feature} must be at least ${min}.`
        );
      }


      if (
        max !== undefined &&
        value > max
      ) {
        throw new Error(
          `${feature} must not be greater than ${max}.`
        );
      }
    };


  // ========================================================
  // RESULT LABEL
  // ========================================================

  const getPredictionLabel =
    () => {
      if (
        selectedModel ===
          "supply_chain" ||
        selectedModel ===
          "retail"
      ) {
        return "Forecast Demand";
      }


      if (
        selectedModel ===
        "logistics_kpi"
      ) {
        return "KPI Score";
      }


      if (
        selectedModel ===
        "stockout"
      ) {
        return "Stockout Risk";
      }


      return "Prediction";
    };


  // ========================================================
  // FORMAT PREDICTION
  // ========================================================

  const formatPrediction =
    () => {
      if (!result) {
        return "—";
      }


      if (
        selectedModel ===
        "stockout"
      ) {
        return Number(
          result.prediction
        ) === 1
          ? "HIGH RISK"
          : "LOW RISK";
      }


      if (
        typeof result.prediction ===
        "number"
      ) {
        return result.prediction.toFixed(
          4
        );
      }


      return (
        result.prediction ??
        "—"
      );
    };


  // ========================================================
  // DESCRIPTION
  // ========================================================

  const getPredictionDescription =
    () => {
      if (!result) {
        return "";
      }


      const formattedPrediction =
        typeof result.prediction ===
        "number"
          ? result.prediction.toFixed(
              2
            )
          : result.prediction ??
            "—";


      if (
        selectedModel ===
        "supply_chain"
      ) {
        if (
          result.source ===
          "uploaded_csv"
        ) {
          return (
            `SCOPTIMA processed the uploaded supply-chain dataset and automatically generated ` +
            `lag, rolling-demand and calendar features. The model estimates approximately ` +
            `${formattedPrediction} units of demand for the latest valid SKU and warehouse record.`
          );
        }


        return (
          `The model estimates approximately ${formattedPrediction} units of demand using recent ` +
          `sales history, rolling-demand patterns, calendar conditions and promotion activity.`
        );
      }


      if (
        selectedModel ===
        "retail"
      ) {
        if (
          result.source ===
          "uploaded_csv"
        ) {
          return (
            `SCOPTIMA processed the uploaded Retail dataset and automatically generated pricing, ` +
            `inventory, lag, rolling-demand, momentum and calendar features. ` +
            `The estimated demand is approximately ${formattedPrediction} units for the latest valid Store/Product record.`
          );
        }


        return (
          `The Retail model estimates approximately ${formattedPrediction} units of product demand. ` +
          `This can support purchasing, inventory allocation and sales planning.`
        );
      }


      if (
        selectedModel ===
        "logistics_kpi"
      ) {
        if (
          result.source ===
          "uploaded_csv"
        ) {
          return (
            `SCOPTIMA processed the uploaded logistics dataset and calculated inventory value, ` +
            `holding cost, lead-time demand, safety stock, optimized reorder point and related operational features. ` +
            `The estimated KPI score is ${formattedPrediction}.`
          );
        }


        return (
          `The logistics KPI estimator produced a score of ${formattedPrediction}. ` +
          `This summarizes estimated operational performance based on inventory, demand, fulfillment and logistics characteristics.`
        );
      }


      if (
        selectedModel ===
        "stockout"
      ) {
        const probability =
          result.stockout_probability !==
            undefined &&
          result.stockout_probability !==
            null
            ? `${(
                result.stockout_probability *
                100
              ).toFixed(
                2
              )}%`
            : "the calculated probability";


        if (
          Number(
            result.prediction
          ) === 1
        ) {
          return (
            `The model identifies this item as HIGH stockout risk. ` +
            `The estimated probability of stockout is ${probability}. ` +
            `Inventory availability, reorder timing and replenishment requirements should be reviewed.`
          );
        }


        return (
          `The model identifies this item as LOW stockout risk. ` +
          `The estimated stockout probability is ${probability}. ` +
          `Continue monitoring inventory levels and future demand conditions.`
        );
      }


      return "";
    };


  // ========================================================
  // MANUAL ANALYSIS
  // ========================================================

  const runManualAnalysis =
    async () => {
      if (
        !selectedRequirement
      ) {
        return;
      }


      const inputData:
        Record<
          string,
          string | number
        > = {};


      for (
        const feature
        of selectedRequirement.features
      ) {
        const value =
          formData[
            feature
          ]?.trim();


        if (!value) {
          throw new Error(
            `Please enter ${feature}.`
          );
        }


        if (
          isCategorical(
            feature
          )
        ) {
          inputData[
            feature
          ] =
            value;
        } else {
          const numericValue =
            Number(
              value
            );


          if (
            Number.isNaN(
              numericValue
            )
          ) {
            throw new Error(
              `${feature} must be a number.`
            );
          }


          validateField(
            feature,
            numericValue
          );


          inputData[
            feature
          ] =
            numericValue;
        }
      }


      const response =
        await fetch(
          `${API_BASE}${selectedConfig.endpoint}`,
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  input_data:
                    inputData,
                }
              ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Prediction failed: ${response.status}`
        );
      }


      setResult(
        data
      );
    };


  // ========================================================
  // CSV ANALYSIS
  // ========================================================

  const runCsvAnalysis =
    async () => {
      if (!csvFile) {
        throw new Error(
          "Please select a CSV file."
        );
      }


      const uploadData =
        new FormData();


      uploadData.append(
        "file",
        csvFile
      );


      let endpoint =
        "";


      if (
        selectedModel ===
        "supply_chain"
      ) {
        endpoint =
          "/api/predictions/supply-chain-from-csv";
      }


      if (
        selectedModel ===
        "retail"
      ) {
        endpoint =
          "/api/predictions/retail-from-csv";
      }


      if (
        selectedModel ===
        "logistics_kpi"
      ) {
        endpoint =
          "/api/predictions/logistics-kpi-from-csv";
      }


      if (
        selectedModel ===
        "stockout"
      ) {
        endpoint =
          "/api/predictions/stockout-from-csv";
      }


      if (!endpoint) {
        throw new Error(
          "CSV upload is not available for this model."
        );
      }


      const response =
        await fetch(
          `${API_BASE}${endpoint}`,
          {
            method:
              "POST",

            credentials:
              "include",

            body:
              uploadData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `CSV analysis failed: ${response.status}`
        );
      }


      setResult(
        data
      );
    };


  // ========================================================
  // RUN
  // ========================================================

  const runAnalysis =
    async () => {
      try {
        setRunning(
          true
        );

        setError(
          ""
        );

        setResult(
          null
        );


        if (
          inputMode ===
          "csv"
        ) {
          await runCsvAnalysis();
        } else {
          await runManualAnalysis();
        }

      } catch (err) {

        if (
          err instanceof Error
        ) {
          setError(
            err.message
          );
        } else {
          setError(
            "Unable to run analysis."
          );
        }

      } finally {

        setRunning(
          false
        );

      }
    };


  // ========================================================
  // UPLOAD TITLE
  // ========================================================

  const getUploadTitle =
    () => {
      if (
        selectedModel ===
        "supply_chain"
      ) {
        return "Upload Supply Chain Dataset";
      }


      if (
        selectedModel ===
        "retail"
      ) {
        return "Upload Retail Dataset";
      }


      if (
        selectedModel ===
        "logistics_kpi"
      ) {
        return "Upload Logistics Dataset for KPI Analysis";
      }


      return "Upload Logistics Dataset for Stockout Analysis";
    };


  // ========================================================
  // UPLOAD DESCRIPTION
  // ========================================================

  const getUploadDescription =
    () => {
      if (
        selectedModel ===
        "supply_chain"
      ) {
        return (
          "Upload historical supply-chain data. " +
          "SCOPTIMA will automatically generate lag, rolling-demand " +
          "and calendar features before forecasting demand."
        );
      }


      if (
        selectedModel ===
        "retail"
      ) {
        return (
          "Upload historical retail data. " +
          "SCOPTIMA will automatically generate price, inventory, " +
          "lag, rolling-demand, momentum and calendar features."
        );
      }


      if (
        selectedModel ===
        "logistics_kpi"
      ) {
        return (
          "Upload logistics data. SCOPTIMA will automatically calculate " +
          "inventory value, annual holding cost, lead-time demand, safety stock, " +
          "optimized reorder point and related logistics features before estimating the KPI."
        );
      }


      return (
        "Upload logistics data. SCOPTIMA will automatically generate " +
        "inventory and replenishment features before evaluating stockout risk."
      );
    };


  return (
    <div className="run-analysis-page">


      {/* =========================================
          HEADER
      ========================================= */}

      <div className="run-analysis-header">

        <span className="dashboard-eyebrow">
          AI DECISION ENGINE
        </span>


        <h1>
          Run Analysis
        </h1>


        <p>
          Execute trained models manually
          or analyze uploaded historical
          datasets directly.
        </p>

      </div>


      {/* ERROR */}

      {error && (
        <div className="dashboard-data-error">
          {error}
        </div>
      )}


      <div className="analysis-layout">


        {/* =====================================
            INPUT PANEL
        ===================================== */}

        <section className="dashboard-panel">


          <div className="panel-heading">

            <div>

              <span>
                MODEL INPUT
              </span>


              <h3>
                Analysis Configuration
              </h3>

            </div>

          </div>


          <label className="analysis-field-label">
            Prediction Model
          </label>


          <select
            className="analysis-model-select"

            value={
              selectedModel
            }

            onChange={(
              event
            ) => {

              setSelectedModel(
                event.target
                  .value as ModelKey
              );

              setResult(
                null
              );

              setError(
                ""
              );

              setCsvFile(
                null
              );

            }}
          >

            {modelOptions.map(
              (
                model
              ) => (

                <option
                  key={
                    model.value
                  }

                  value={
                    model.value
                  }
                >
                  {
                    model.label
                  }
                </option>

              )
            )}

          </select>


          {/* =====================================
              MANUAL / CSV MODE
          ===================================== */}

          <div className="analysis-mode-switch">


            <button
              type="button"

              className={
                inputMode ===
                "manual"
                  ? "active"
                  : ""
              }

              onClick={() => {

                setInputMode(
                  "manual"
                );

                setResult(
                  null
                );

                setError(
                  ""
                );

              }}
            >
              Manual Input
            </button>


            <button
              type="button"

              className={
                inputMode ===
                "csv"
                  ? "active"
                  : ""
              }

              onClick={() => {

                setInputMode(
                  "csv"
                );

                setResult(
                  null
                );

                setError(
                  ""
                );

              }}
            >
              Upload CSV
            </button>

          </div>


          {/* =====================================
              MODEL INFO
          ===================================== */}

          {selectedRequirement && (

            <div className="analysis-model-info">


              <div>

                <span>
                  Target
                </span>


                <strong>
                  {
                    selectedRequirement.target
                  }
                </strong>

              </div>


              <div>

                <span>
                  Required Inputs
                </span>


                <strong>
                  {
                    selectedRequirement
                      .features
                      .length
                  }
                </strong>

              </div>

            </div>

          )}


          {/* =====================================
              CSV MODE
          ===================================== */}

          {inputMode ===
          "csv" ? (

            <div className="analysis-upload-area">


              <div className="analysis-upload-icon">
                ↑
              </div>


              <h4>
                {
                  getUploadTitle()
                }
              </h4>


              <p>
                {
                  getUploadDescription()
                }
              </p>


              <input
                type="file"

                accept=".csv,text/csv"

                onChange={(
                  event
                ) => {

                  const file =
                    event.target
                      .files?.[
                        0
                      ] ??
                    null;


                  setCsvFile(
                    file
                  );

                  setError(
                    ""
                  );

                  setResult(
                    null
                  );

                }}
              />


              {csvFile && (

                <div className="analysis-selected-file">


                  <span>
                    Selected file
                  </span>


                  <strong>
                    {
                      csvFile.name
                    }
                  </strong>

                </div>

              )}

            </div>

          ) : (


            /* =====================================
                MANUAL MODE
            ===================================== */

            loadingRequirements ? (

              <div className="analysis-loading">
                Loading model requirements...
              </div>

            ) : (

              <div className="analysis-fields-grid">

                {selectedRequirement
                  ?.features
                  .map(
                    (
                      feature
                    ) => (

                      <div
                        className="analysis-field"

                        key={
                          feature
                        }
                      >

                        <label>
                          {
                            feature
                          }
                        </label>


                        {/* DAY OF WEEK */}

                        {(
                          feature ===
                            "day_of_week" ||
                          feature ===
                            "DayOfWeek" ||
                          feature ===
                            "restock_dayofweek"
                        ) ? (

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select day
                            </option>

                            <option value="0">
                              Monday
                            </option>

                            <option value="1">
                              Tuesday
                            </option>

                            <option value="2">
                              Wednesday
                            </option>

                            <option value="3">
                              Thursday
                            </option>

                            <option value="4">
                              Friday
                            </option>

                            <option value="5">
                              Saturday
                            </option>

                            <option value="6">
                              Sunday
                            </option>

                          </select>


                        ) : (
                          feature ===
                            "month" ||
                          feature ===
                            "Month" ||
                          feature ===
                            "restock_month"
                        ) ? (


                          /* MONTH */

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select month
                            </option>

                            <option value="1">
                              January
                            </option>

                            <option value="2">
                              February
                            </option>

                            <option value="3">
                              March
                            </option>

                            <option value="4">
                              April
                            </option>

                            <option value="5">
                              May
                            </option>

                            <option value="6">
                              June
                            </option>

                            <option value="7">
                              July
                            </option>

                            <option value="8">
                              August
                            </option>

                            <option value="9">
                              September
                            </option>

                            <option value="10">
                              October
                            </option>

                            <option value="11">
                              November
                            </option>

                            <option value="12">
                              December
                            </option>

                          </select>


                        ) : feature ===
                          "restock_quarter" ? (


                          /* QUARTER */

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select quarter
                            </option>

                            <option value="1">
                              Q1
                            </option>

                            <option value="2">
                              Q2
                            </option>

                            <option value="3">
                              Q3
                            </option>

                            <option value="4">
                              Q4
                            </option>

                          </select>


                        ) : (
                          feature ===
                            "promotion_flag" ||
                          feature ===
                            "Promotion_Flag"
                        ) ? (


                          /* PROMOTION */

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select promotion
                            </option>

                            <option value="0">
                              No
                            </option>

                            <option value="1">
                              Yes
                            </option>

                          </select>


                        ) : feature ===
                          "Holiday/Promotion" ? (


                          /* HOLIDAY */

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select option
                            </option>

                            <option value="0">
                              No
                            </option>

                            <option value="1">
                              Yes
                            </option>

                          </select>


                        ) : feature ===
                          "IsWeekend" ? (


                          /* WEEKEND */

                          <select
                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select option
                            </option>

                            <option value="0">
                              Weekday
                            </option>

                            <option value="1">
                              Weekend
                            </option>

                          </select>


                        ) : (


                          /* STANDARD INPUT */

                          <input
                            type={
                              isCategorical(
                                feature
                              )
                                ? "text"
                                : "number"
                            }

                            step="any"

                            min={
                              getFieldMin(
                                feature
                              )
                            }

                            max={
                              getFieldMax(
                                feature
                              )
                            }

                            value={
                              formData[
                                feature
                              ] ?? ""
                            }

                            placeholder={
                              isCategorical(
                                feature
                              )
                                ? `Enter ${feature}`
                                : "Enter value"
                            }

                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                feature,
                                event.target
                                  .value
                              )
                            }
                          />

                        )}

                      </div>

                    )
                  )}

              </div>

            )

          )}


          {/* =====================================
              RUN BUTTON
          ===================================== */}

          <button
            type="button"

            className="dashboard-primary-button analysis-run-button"

            disabled={
              running ||
              loadingRequirements
            }

            onClick={
              runAnalysis
            }
          >

            {running
              ? inputMode ===
                "csv"
                ? "Analyzing Dataset..."
                : "Running AI Analysis..."
              : inputMode ===
                "csv"
              ? "Upload & Analyze"
              : "Run AI Analysis"}

          </button>

        </section>


        {/* =====================================
            RESULT PANEL
        ===================================== */}

        <section className="dashboard-panel analysis-result-panel">


          <div className="panel-heading">

            <div>

              <span>
                AI OUTPUT
              </span>


              <h3>
                Prediction Result
              </h3>

            </div>

          </div>


          {!result ? (

            <div className="analysis-empty-state">


              <strong>
                Ready for analysis
              </strong>


              <p>
                Enter model inputs or
                upload historical data
                to generate a prediction.
              </p>

            </div>

          ) : (

            <div className="analysis-result-content">


              {/* MODEL */}

              <div className="analysis-result-card">

                <span>
                  Model
                </span>


                <strong>
                  {
                    result.model ??
                    "—"
                  }
                </strong>

              </div>


              {/* TYPE */}

              <div className="analysis-result-card">

                <span>
                  Analysis Type
                </span>


                <strong>
                  {
                    result.prediction_type ??
                    "—"
                  }
                </strong>

              </div>


              {/* SOURCE */}

              {result.source && (

                <div className="analysis-result-card">

                  <span>
                    Data Source
                  </span>


                  <strong>

                    {result.source ===
                    "uploaded_csv"
                      ? "Uploaded CSV"
                      : result.source}

                  </strong>

                </div>

              )}


              {/* RESULT */}

              <div className="analysis-result-card primary-result">

                <span>
                  {
                    getPredictionLabel()
                  }
                </span>


                <strong>
                  {
                    formatPrediction()
                  }
                </strong>

              </div>


              {/* =====================================
                  ANALYZED RECORD
              ===================================== */}

              {result.record && (

                <div className="analysis-record-card">


                  <span>
                    ANALYZED RECORD
                  </span>


                  {result.record
                    .sku_id && (

                    <div>

                      <p>
                        SKU
                      </p>

                      <strong>
                        {
                          result.record
                            .sku_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .warehouse_id && (

                    <div>

                      <p>
                        Warehouse
                      </p>

                      <strong>
                        {
                          result.record
                            .warehouse_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .store_id && (

                    <div>

                      <p>
                        Store
                      </p>

                      <strong>
                        {
                          result.record
                            .store_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .product_id && (

                    <div>

                      <p>
                        Product
                      </p>

                      <strong>
                        {
                          result.record
                            .product_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .item_id && (

                    <div>

                      <p>
                        Item
                      </p>

                      <strong>
                        {
                          result.record
                            .item_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .storage_location_id && (

                    <div>

                      <p>
                        Storage Location
                      </p>

                      <strong>
                        {
                          result.record
                            .storage_location_id
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .zone && (

                    <div>

                      <p>
                        Zone
                      </p>

                      <strong>
                        {
                          result.record
                            .zone
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .category && (

                    <div>

                      <p>
                        Category
                      </p>

                      <strong>
                        {
                          result.record
                            .category
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .region && (

                    <div>

                      <p>
                        Region
                      </p>

                      <strong>
                        {
                          result.record
                            .region
                        }
                      </strong>

                    </div>

                  )}


                  {result.record
                    .date && (

                    <div>

                      <p>
                        Date
                      </p>

                      <strong>
                        {
                          result.record
                            .date
                        }
                      </strong>

                    </div>

                  )}

                </div>

              )}


              {/* DESCRIPTION */}

              <div className="analysis-description-card">

                <span>
                  WHAT THIS PREDICTION MEANS
                </span>


                <p>
                  {
                    getPredictionDescription()
                  }
                </p>

              </div>


              {/* GENERATED FEATURES */}

              {result.generated_features && (

                <details className="analysis-generated-features">


                  <summary>
                    Generated Model Features
                  </summary>


                  <div>

                    {Object.entries(
                      result.generated_features
                    ).map(
                      ([
                        key,
                        value,
                      ]) => (

                        <p
                          key={
                            key
                          }
                        >

                          <span>
                            {
                              key
                            }
                          </span>


                          <strong>

                            {typeof value ===
                            "number"
                              ? value.toFixed(
                                  4
                                )
                              : value}

                          </strong>

                        </p>

                      )
                    )}

                  </div>

                </details>

              )}


              {/* CONFIDENCE */}

              {result.confidence !==
                undefined &&
                result.confidence !==
                  null && (

                  <div className="analysis-result-card">

                    <span>
                      Model Confidence
                    </span>


                    <strong>

                      {(
                        result.confidence *
                        100
                      ).toFixed(
                        2
                      )}

                      %

                    </strong>

                  </div>

                )}


              {/* STOCKOUT PROBABILITY */}

              {result.stockout_probability !==
                undefined &&
                result.stockout_probability !==
                  null && (

                  <div className="analysis-result-card danger-result">

                    <span>
                      Stockout Probability
                    </span>


                    <strong>

                      {(
                        result.stockout_probability *
                        100
                      ).toFixed(
                        2
                      )}

                      %

                    </strong>

                  </div>

                )}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}