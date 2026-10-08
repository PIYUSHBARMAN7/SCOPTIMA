export interface DashboardOverviewResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };

  forecast_accuracy: number;

  inventory_status: {
    healthy: number;
    low_stock: number;
    critical: number;
    excess: number;
    total_items: number;
  };

  potential_savings: number | null;
  inventory_value: number | null;

  models: {
    supply_chain: {
      name: string;
      status: string;
    };

    retail: {
      name: string;
      status: string;
      forecast_accuracy: number;
    };

    logistics: {
      name: string;
      status: string;
      r2: number;
    };

    stockout: {
      name: string;
      status: string;
    };
  };
}


export interface ForecastTrendPoint {
  date: string;
  actual: number | null;
  forecast: number | null;
  model_type: string;
}


export interface ForecastTrendResponse {
  points: ForecastTrendPoint[];
  count: number;
}


const API_BASE =
  "http://localhost:8000";


export async function getDashboardOverview():
  Promise<DashboardOverviewResponse> {

  const response =
    await fetch(
      `${API_BASE}/api/dashboard/overview`,
      {
        method: "GET",
        credentials: "include",
      }
    );


  const data =
    await response.json();


  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Dashboard request failed: ${response.status}`
    );
  }


  return data;
}


export async function getForecastTrend():
  Promise<ForecastTrendResponse> {

  const response =
    await fetch(
      `${API_BASE}/api/dashboard/forecast-trend`,
      {
        method: "GET",
        credentials: "include",
      }
    );


  const data =
    await response.json();


  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Forecast trend request failed: ${response.status}`
    );
  }


  return data;
}

export interface InventoryOptimizationRecord {
  category?: string;

  storage_location_id?: string;

  zone?: string;

  stock_level?: number;

  safety_stock?: number;

  optimized_reorder_point?: number;

  recommended_stock?: number;

  excess_stock?: number;

  inventory_value?: number;

  potential_holding_cost_saving?: number;

  inventory_status?: string;
}


export interface InventoryOptimizationResponse {
  summary: {
    total_items: number;

    healthy: number;

    low_stock: number;

    critical: number;

    excess: number;

    total_inventory_value: number;

    potential_savings: number;

    total_excess_stock: number;
  };

  records:
    InventoryOptimizationRecord[];
}


export async function getInventoryOptimization():
  Promise<InventoryOptimizationResponse> {

  const response =
    await fetch(
      "http://localhost:8000/api/dashboard/inventory-optimization",
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
        `Inventory request failed: ${response.status}`
    );
  }


  return data;
}

// ==========================================================
// STOCKOUT RISK
// ==========================================================

export interface StockoutRiskRecord {
  row_id: number;

  item_id?: string;

  category?: string;

  storage_location_id?: string;

  zone?: string;

  stock_level?: number;

  reorder_point?: number;

  safety_stock?: number;

  optimized_reorder_point?: number;

  daily_demand?: number;

  forecasted_demand_next_7d?: number;

  days_of_inventory?: number;

  actual_stockout_risk: number;

  predicted_stockout_risk: number;

  prediction_correct: boolean;

  stockout_probability: number;

  confidence: number;

  risk_level:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";
}


export interface StockoutRiskResponse {
  summary: {
    total_items: number;

    actual_stockouts: number;

    predicted_stockouts: number;

    correct_predictions: number;

    calculated_accuracy: number;

    critical: number;

    high: number;

    medium: number;

    low: number;

    average_probability: number;

    average_confidence: number;

    true_positive: number;

    true_negative: number;

    false_positive: number;

    false_negative: number;

    model_accuracy: number;

    model_precision: number;

    model_recall: number;

    model_f1: number;
  };

  model: {
    name: string;

    status: string;

    source?: string;
  };

  records: StockoutRiskRecord[];
}


export async function getStockoutRisk():
  Promise<StockoutRiskResponse> {

  const response =
    await fetch(
      "http://localhost:8000/api/dashboard/stockout-risk",
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
        `Stockout request failed: ${response.status}`
    );

  }


  return data;
}

// ==========================================================
// COST SAVINGS
// ==========================================================

export interface CostSavingsCategory {
  category: string;

  item_count: number;

  inventory_value: number;

  excess_stock: number;

  excess_value: number;

  annual_holding_cost: number;

  potential_savings: number;
}


export interface CostSavingsRecord {
  row_id: number;

  category: string;

  storage_location_id: string;

  zone: string;

  stock_level: number;

  recommended_stock: number;

  excess_stock: number;

  inventory_value: number;

  excess_stock_value: number;

  annual_holding_cost: number;

  potential_savings: number;
}


export interface CostSavingsResponse {
  summary: {
    total_items: number;

    items_with_savings: number;

    total_inventory_value: number;

    total_excess_stock: number;

    total_excess_value: number;

    annual_holding_cost: number;

    potential_savings: number;

    savings_rate: number;

    excess_value_rate: number;
  };

  categories:
    CostSavingsCategory[];

  records:
    CostSavingsRecord[];
}


export async function getCostSavings():
  Promise<CostSavingsResponse> {

  const response =
    await fetch(
      "http://localhost:8000/api/dashboard/cost-savings",
      {
        method:
          "GET",

        credentials:
          "include",
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data?.detail ||
        `Cost savings request failed: ${response.status}`
    );

  }


  return data;
}

// ==========================================================
// MODEL PERFORMANCE
// ==========================================================

export interface ModelMetricSet {
  mae: number | null;

  rmse: number | null;

  r2: number | null;

  accuracy: number | null;

  precision: number | null;

  recall: number | null;

  f1: number | null;
}


export interface RetailBenchmark {
  name: string;

  mae: number;

  rmse: number;

  r2: number;

  wape: number;

  forecast_accuracy: number;
}


export interface ModelPerformanceItem {
  key:
    | "supply_chain"
    | "retail"
    | "logistics_kpi"
    | "stockout";

  name: string;

  task: string;

  model_type:
    | "Regression"
    | "Classification";

  status: string;

  metrics: ModelMetricSet;

  benchmark?: RetailBenchmark;

  metric_source: string;

  description: string;
}


export interface ModelPerformanceResponse {
  summary: {
    total_models: number;

    active_models: number;

    regression_models: number;

    classification_models: number;

    stockout_accuracy: number;

    logistics_r2: number;
  };

  models:
    ModelPerformanceItem[];
}


export async function getModelPerformance():
  Promise<ModelPerformanceResponse> {

  const response =
    await fetch(
      "http://localhost:8000/api/dashboard/model-performance",
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
        `Model performance request failed: ${response.status}`
    );

  }


  return data;
}

// ==========================================================
// REPORTS
// ==========================================================

export interface ReportGeneratedFor {
  full_name: string;
  email: string;
  role: string;
}

export interface ReportExecutiveSummary {
  tracked_inventory_items: number;
  healthy_items: number;
  low_stock_items: number;
  critical_items: number;
  excess_items: number;
  total_inventory_value: number;
  potential_savings: number;
  predicted_stockouts: number;
  active_models: number;
}

export interface ReportDemandForecast {
  records: number;
  latest_forecast: number | null;
  average_forecast: number | null;
  average_actual: number | null;
  history: Array<{
    timestamp?: string;
    date?: string;
    model_type?: string;
    actual?: number | null;
    forecast?: number | null;
  }>;
}

export interface ReportResponse {
  generated_at: string;

  generated_for: ReportGeneratedFor;

  executive_summary: ReportExecutiveSummary;

  demand_forecast: ReportDemandForecast;

  inventory: {
    summary: Record<string, number>;
    top_records: Array<Record<string, unknown>>;
  };

  stockout: {
    summary: Record<string, number>;
    model: Record<string, unknown>;
    top_risk_records: Array<Record<string, unknown>>;
  };

  cost_savings: {
    summary: Record<string, number>;
    categories: Array<Record<string, unknown>>;
    top_opportunities: Array<Record<string, unknown>>;
  };

  model_performance: {
    summary: Record<string, number>;
    models: Array<Record<string, any>>;
  };
}

export async function getExecutiveReport():
  Promise<ReportResponse> {

  const response = await fetch(
    "http://localhost:8000/api/dashboard/report",
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      `Report request failed: ${response.status}`
    );
  }

  return data;
}

// ==========================================================
// DATA QUALITY
// ==========================================================

export interface DataQualityColumn {
  column: string;

  dtype: string;

  missing_values: number;

  missing_percentage: number;

  unique_values: number;
}


export interface DataQualityDataset {
  key: string;

  name: string;

  available: boolean;

  status:
    | "Excellent"
    | "Good"
    | "Warning"
    | "Critical"
    | "Empty"
    | "Missing";

  path: string;

  rows: number;

  columns: number;

  total_cells: number;

  missing_values: number;

  missing_percentage: number;

  duplicate_rows: number;

  duplicate_percentage: number;

  negative_values: number;

  invalid_numeric_values: number;

  completeness_score: number;

  uniqueness_score: number;

  validity_score: number;

  quality_score: number;

  ml_ready: boolean;

  file_size_bytes: number;

  last_modified: string | null;

  issues: string[];

  column_quality: DataQualityColumn[];
}


export interface DataQualityResponse {
  generated_at: string;

  summary: {
    datasets_monitored: number;

    datasets_available: number;

    ml_ready_datasets: number;

    total_rows: number;

    total_cells: number;

    missing_values: number;

    duplicate_rows: number;

    negative_values: number;

    invalid_numeric_values: number;

    overall_quality_score: number;

    overall_status: string;
  };

  datasets: DataQualityDataset[];
}


export async function getDataQuality():
  Promise<DataQualityResponse> {

  const response =
    await fetch(
      "http://localhost:8000/api/dashboard/data-quality",
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
      `Data quality request failed: ${response.status}`
    );

  }


  return data;
}

// ==========================================================
// COMPARISON MODE
// ==========================================================

export interface ComparisonOptions {
  warehouses: string[];
  products: string[];
}

export interface ComparisonEntity {
  id: string;
  [key: string]: string | number;
}

export interface EntityComparisonResponse {
  mode: string;
  left: ComparisonEntity;
  right: ComparisonEntity;
}

export interface PeriodComparisonResponse {
  mode: string;

  previous: {
    label: string;
    records: number;
    total_demand: number;
    average_demand: number;
    start_date: string;
    end_date: string;
  };

  current: {
    label: string;
    records: number;
    total_demand: number;
    average_demand: number;
    start_date: string;
    end_date: string;
  };

  average_demand_change_percentage: number;
}

export interface ActualForecastResponse {
  mode: string;

  summary: {
    records: number;
    average_actual: number;
    average_forecast: number;
    mae: number;
  };

  points: Array<{
    date: string;
    actual: number;
    forecast: number;
  }>;
}


async function dashboardGet<T>(
  path: string
): Promise<T> {

  const response =
    await fetch(
      `http://localhost:8000/api/dashboard${path}`,
      {
        credentials: "include",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      `Request failed: ${response.status}`
    );
  }

  return data;
}


export function getComparisonOptions() {
  return dashboardGet<ComparisonOptions>(
    "/comparison/options"
  );
}


export function compareWarehouses(
  warehouseA: string,
  warehouseB: string
) {
  return dashboardGet<EntityComparisonResponse>(
    `/comparison/warehouses?warehouse_a=${encodeURIComponent(
      warehouseA
    )}&warehouse_b=${encodeURIComponent(
      warehouseB
    )}`
  );
}


export function compareProducts(
  productA: string,
  productB: string
) {
  return dashboardGet<EntityComparisonResponse>(
    `/comparison/products?product_a=${encodeURIComponent(
      productA
    )}&product_b=${encodeURIComponent(
      productB
    )}`
  );
}


export function comparePeriods() {
  return dashboardGet<PeriodComparisonResponse>(
    "/comparison/periods"
  );
}


export function compareActualForecast() {
  return dashboardGet<ActualForecastResponse>(
    "/comparison/actual-forecast"
  );
}