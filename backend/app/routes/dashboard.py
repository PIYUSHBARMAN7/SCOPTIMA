from pathlib import Path

import pandas as pd

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from app.models.user import User

from app.services.comparison_service import (
    actual_vs_forecast,
    compare_products,
    compare_warehouses,
    current_vs_previous,
    get_comparison_options,
)

from app.services.data_quality_service import (
    get_data_quality_summary,
)

from app.services.report_service import (
    get_executive_report,
)

from app.services.model_performance_service import (
    get_model_performance_summary,
)

from app.services.cost_savings_service import (
    get_cost_savings_summary,
)

from app.services.stockout_service import (
    get_stockout_risk_summary,
)

from app.services.inventory_service import (
    get_inventory_optimization_summary,
)

from app.routes.auth import (
    get_current_user,
)

from app.services.prediction_history_service import (
    get_prediction_history,
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


# ==========================================================
# PATHS
# ==========================================================

BACKEND_DIR = Path(
    __file__
).resolve().parents[2]


DATA_DIR = (
    BACKEND_DIR
    / "data"
)


LOGISTICS_FILE = (
    DATA_DIR
    / "logistics_inventory_optimization.csv"
)


# ==========================================================
# LOAD INVENTORY DATA
# ==========================================================

def load_inventory_data():
    if not LOGISTICS_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                "Logistics inventory data "
                "is not available."
            ),
        )


    try:
        return pd.read_csv(
            LOGISTICS_FILE
        )


    except Exception as error:

        print(
            "Inventory data error:",
            repr(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load inventory "
                "optimization data."
            ),
        )


# ==========================================================
# INVENTORY STATUS
# ==========================================================

def calculate_inventory_status(
    df: pd.DataFrame,
):
    required_columns = [
        "stock_level",
        "safety_stock",
        "optimized_reorder_point",
        "recommended_stock",
        "excess_stock",
    ]


    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]


    if missing:
        raise HTTPException(
            status_code=500,
            detail=(
                "Inventory data is missing columns: "
                + ", ".join(
                    missing
                )
            ),
        )


    stock_level = pd.to_numeric(
        df[
            "stock_level"
        ],
        errors="coerce",
    ).fillna(0)


    safety_stock = pd.to_numeric(
        df[
            "safety_stock"
        ],
        errors="coerce",
    ).fillna(0)


    optimized_reorder_point = pd.to_numeric(
        df[
            "optimized_reorder_point"
        ],
        errors="coerce",
    ).fillna(0)


    excess_stock = pd.to_numeric(
        df[
            "excess_stock"
        ],
        errors="coerce",
    ).fillna(0)


    # ------------------------------------------------------
    # CRITICAL
    # ------------------------------------------------------

    critical_mask = (
        stock_level
        < safety_stock
    )


    # ------------------------------------------------------
    # LOW STOCK
    # ------------------------------------------------------

    low_stock_mask = (
        (
            stock_level
            >= safety_stock
        )
        &
        (
            stock_level
            < optimized_reorder_point
        )
    )


    # ------------------------------------------------------
    # EXCESS
    # ------------------------------------------------------

    excess_mask = (
        excess_stock
        > 0
    )


    # ------------------------------------------------------
    # HEALTHY
    # ------------------------------------------------------

    healthy_mask = (
        ~critical_mask
        &
        ~low_stock_mask
        &
        ~excess_mask
    )


    return {
        "healthy":
            int(
                healthy_mask.sum()
            ),

        "low_stock":
            int(
                low_stock_mask.sum()
            ),

        "critical":
            int(
                critical_mask.sum()
            ),

        "excess":
            int(
                excess_mask.sum()
            ),

        "total_items":
            int(
                len(df)
            ),
    }


# ==========================================================
# POTENTIAL SAVINGS
# ==========================================================

def calculate_potential_savings(
    df: pd.DataFrame,
):
    column = (
        "potential_holding_cost_saving"
    )


    if column not in df.columns:
        return None


    values = pd.to_numeric(
        df[column],
        errors="coerce",
    ).fillna(0)


    return round(
        float(
            values.sum()
        ),
        2,
    )


# ==========================================================
# INVENTORY VALUE
# ==========================================================

def calculate_inventory_value(
    df: pd.DataFrame,
):
    if (
        "inventory_value"
        in df.columns
    ):

        values = pd.to_numeric(
            df[
                "inventory_value"
            ],
            errors="coerce",
        ).fillna(0)


        return round(
            float(
                values.sum()
            ),
            2,
        )


    if (
        "stock_level"
        not in df.columns
        or
        "unit_price"
        not in df.columns
    ):
        return None


    stock = pd.to_numeric(
        df[
            "stock_level"
        ],
        errors="coerce",
    ).fillna(0)


    price = pd.to_numeric(
        df[
            "unit_price"
        ],
        errors="coerce",
    ).fillna(0)


    return round(
        float(
            (
                stock *
                price
            ).sum()
        ),
        2,
    )


# ==========================================================
# DASHBOARD OVERVIEW
# ==========================================================

@router.get(
    "/overview"
)
def get_dashboard_overview(
    current_user: User = Depends(
        get_current_user
    ),
):
    df = load_inventory_data()


    inventory_status = (
        calculate_inventory_status(
            df
        )
    )


    potential_savings = (
        calculate_potential_savings(
            df
        )
    )


    inventory_value = (
        calculate_inventory_value(
            df
        )
    )


    return {
        "user": {
            "id":
                current_user.id,

            "full_name":
                current_user.full_name,

            "email":
                current_user.email,

            "role":
                current_user.role,
        },


        # Retail demand model dashboard accuracy
        "forecast_accuracy":
            94.61,


        "inventory_status":
            inventory_status,


        "potential_savings":
            potential_savings,


        "inventory_value":
            inventory_value,


        "models": {

            "supply_chain": {
                "name":
                    "HistGradientBoostingRegressor",

                "status":
                    "active",
            },


            "retail": {
                "name":
                    "HistGradientBoostingRegressor",

                "status":
                    "active",

                "forecast_accuracy":
                    94.61,
            },


            "logistics": {
                "name":
                    "CatBoost KPI Estimator",

                "status":
                    "active",

                "r2":
                    0.997797,
            },


            "stockout": {
                "name":
                    "CatBoost Stockout Classifier",

                "status":
                    "active",
            },
        },
    }


# ==========================================================
# INVENTORY STATUS
# ==========================================================

@router.get(
    "/inventory-status"
)
def get_inventory_status(
    current_user: User = Depends(
        get_current_user
    ),
):
    df = load_inventory_data()


    return {
        "inventory_status":
            calculate_inventory_status(
                df
            ),

        "potential_savings":
            calculate_potential_savings(
                df
            ),

        "inventory_value":
            calculate_inventory_value(
                df
            ),
    }


# ==========================================================
# MODELS
# ==========================================================

@router.get(
    "/models"
)
def get_models(
    current_user: User = Depends(
        get_current_user
    ),
):
    return {

        "supply_chain": {
            "model":
                "HistGradientBoostingRegressor",

            "task":
                "Demand Forecasting",

            "status":
                "active",
        },


        "retail": {
            "model":
                "HistGradientBoostingRegressor",

            "task":
                "Retail Demand Forecasting",

            "status":
                "active",

            "forecast_accuracy":
                94.61,
        },


        "logistics_kpi": {
            "model":
                "CatBoost KPI Estimator",

            "task":
                "Logistics KPI Estimation",

            "status":
                "active",

            "mae":
                0.003583,

            "rmse":
                0.005371,

            "r2":
                0.997797,
        },


        "stockout": {
            "model":
                "CatBoost Stockout Classifier",

            "task":
                "Stockout Risk Classification",

            "status":
                "active",

            "accuracy":
                0.996880,

            "precision":
                0.998331,

            "recall":
                0.998331,

            "f1":
                0.998331,
        },
    }


# ==========================================================
# FORECAST SUMMARY
# ==========================================================

@router.get(
    "/forecast-summary"
)
def get_forecast_summary(
    current_user: User = Depends(
        get_current_user
    ),
):
    return {

        "retail": {
            "forecast_accuracy":
                94.61,

            "model":
                "HistGradientBoostingRegressor",
        },


        "supply_chain": {
            "model":
                "HistGradientBoostingRegressor",

            "status":
                "active",
        },
    }


# ==========================================================
# REAL FORECAST TREND
# ==========================================================

@router.get(
    "/forecast-trend"
)
def get_forecast_trend(
    current_user: User = Depends(
        get_current_user
    ),
):
    points = (
        get_prediction_history(
            limit=30
        )
    )


    return {
        "points":
            points,

        "count":
            len(
                points
            ),
    }

@router.get(
    "/inventory-optimization"
)
def get_inventory_optimization(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return (
            get_inventory_optimization_summary()
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(
            "Inventory optimization error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load inventory optimization data."
            ),
        )
        
# ==========================================================
# STOCKOUT RISK
# ==========================================================

@router.get(
    "/stockout-risk"
)
def get_stockout_risk(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return (
            get_stockout_risk_summary()
        )


    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:

        print(
            "Stockout dashboard error:",
            repr(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate stockout risk intelligence."
            ),
        )
        
# ==========================================================
# COST SAVINGS
# ==========================================================

@router.get(
    "/cost-savings"
)
def get_cost_savings(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return (
            get_cost_savings_summary()
        )


    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:

        print(
            "Cost savings dashboard error:",
            repr(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate cost savings intelligence."
            ),
        )
        
# ==========================================================
# MODEL PERFORMANCE
# ==========================================================

@router.get(
    "/model-performance"
)
def get_model_performance(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return (
            get_model_performance_summary()
        )

    except Exception as error:

        print(
            "Model performance dashboard error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load model performance information."
            ),
        )
        
# ==========================================================
# REPORTS
# ==========================================================

@router.get(
    "/report"
)
def get_report(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:

        report = (
            get_executive_report()
        )


        report[
            "generated_for"
        ] = {
            "full_name":
                current_user.full_name,

            "email":
                current_user.email,

            "role":
                current_user.role,
        }


        return report


    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(
                error
            ),
        )


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(
                error
            ),
        )


    except Exception as error:

        print(
            "Report generation error:",
            repr(
                error
            ),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate report."
            ),
        )
        
# ==========================================================
# DATA QUALITY
# ==========================================================

@router.get(
    "/data-quality"
)
def get_data_quality(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:

        return (
            get_data_quality_summary()
        )


    except Exception as error:

        print(
            "Data quality dashboard error:",
            repr(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate data quality intelligence."
            ),
        )
        
# ==========================================================
# COMPARISON MODE
# ==========================================================

@router.get("/comparison/options")
def comparison_options(
    current_user: User = Depends(get_current_user),
):
    return get_comparison_options()


@router.get("/comparison/warehouses")
def warehouse_comparison(
    warehouse_a: str = Query(...),
    warehouse_b: str = Query(...),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:

        if warehouse_a == warehouse_b:
            raise ValueError(
                "Select two different warehouses."
            )

        return compare_warehouses(
            warehouse_a,
            warehouse_b,
        )

    except (
        ValueError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/comparison/products")
def product_comparison(
    product_a: str = Query(...),
    product_b: str = Query(...),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:

        if product_a == product_b:
            raise ValueError(
                "Select two different products."
            )

        return compare_products(
            product_a,
            product_b,
        )

    except (
        ValueError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/comparison/periods")
def period_comparison(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return current_vs_previous()

    except (
        ValueError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/comparison/actual-forecast")
def forecast_comparison(
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        return actual_vs_forecast()

    except (
        ValueError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )