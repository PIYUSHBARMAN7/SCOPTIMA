def get_model_performance_summary():
    """
    Model-performance information used by the SCOPTIMA dashboard.

    Important:
    - Supply Chain deployment currently uses
      HistGradientBoostingRegressor.
    - Retail deployment currently uses
      HistGradientBoostingRegressor-compatible artifacts.
    - Logistics KPI uses CatBoost.
    - Stockout uses CatBoost classifier.

    Metrics below are only included where we have verified results.
    """

    models = [
        {
            "key": "supply_chain",
            "name": "HistGradientBoostingRegressor",
            "task": "Supply Chain Demand Forecasting",
            "model_type": "Regression",
            "status": "active",

            "metrics": {
                "mae": 5.5071,
                "rmse": 6.9318,
                "r2": None,
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1": None,
            },

            "metric_source":
                "Current deployed supply-chain artifact evaluation",

            "description":
                "Forecasts supply-chain demand using lag, rolling-demand, "
                "calendar and promotion features.",
        },

        {
            "key": "retail",
            "name": "HistGradientBoostingRegressor",
            "task": "Retail Demand Forecasting",
            "model_type": "Regression",
            "status": "active",

            "metrics": {
                "mae": None,
                "rmse": None,
                "r2": None,
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1": None,
            },

            "benchmark": {
                "name": "Elite Ensemble benchmark",
                "mae": 7.320588,
                "rmse": 8.540078,
                "r2": 0.993758,
                "wape": 5.300357,
                "forecast_accuracy": 94.699643,
            },

            "metric_source":
                "Deployment artifact and training benchmark shown separately",

            "description":
                "Estimates retail demand from product, store, pricing, "
                "inventory, lag, rolling and calendar features.",
        },

        {
            "key": "logistics_kpi",
            "name": "CatBoost KPI Estimator",
            "task": "Logistics KPI Estimation",
            "model_type": "Regression",
            "status": "active",

            "metrics": {
                "mae": 0.003583,
                "rmse": 0.005371,
                "r2": 0.997797,
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1": None,
            },

            "metric_source":
                "Verified CatBoost KPI evaluation",

            "description":
                "Estimates logistics KPI performance from operational "
                "inventory and fulfillment characteristics.",
        },

        {
            "key": "stockout",
            "name": "CatBoost Stockout Classifier",
            "task": "Stockout Risk Classification",
            "model_type": "Classification",
            "status": "active",

            "metrics": {
                "mae": None,
                "rmse": None,
                "r2": None,
                "accuracy": 0.996880,
                "precision": 0.998331,
                "recall": 0.998331,
                "f1": 0.998331,
            },

            "metric_source":
                "Verified CatBoost stockout evaluation",

            "description":
                "Classifies stockout risk and produces probability estimates "
                "for logistics inventory records.",
        },
    ]


    regression_models = [
        model
        for model in models
        if model["model_type"] == "Regression"
    ]


    classification_models = [
        model
        for model in models
        if model["model_type"] == "Classification"
    ]


    active_models = sum(
        1
        for model in models
        if model["status"] == "active"
    )


    return {
        "summary": {
            "total_models":
                len(models),

            "active_models":
                active_models,

            "regression_models":
                len(regression_models),

            "classification_models":
                len(classification_models),

            "stockout_accuracy":
                0.996880,

            "logistics_r2":
                0.997797,
        },

        "models":
            models,
    }