from io import BytesIO

import numpy as np
import pandas as pd

from app.services.model_service import (
    MODEL_PATHS,
    load_pickle,
)


# ==========================================================
# REQUIRED RAW LOGISTICS COLUMNS
# ==========================================================

REQUIRED_RAW_COLUMNS = [
    "category",
    "stock_level",
    "reorder_point",
    "reorder_frequency_days",
    "lead_time_days",
    "daily_demand",
    "demand_std_dev",
    "item_popularity_score",
    "storage_location_id",
    "zone",
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
    "last_restock_date",
]


MODEL_FEATURES = [
    "category",
    "stock_level",
    "reorder_point",
    "reorder_frequency_days",
    "lead_time_days",
    "daily_demand",
    "demand_std_dev",
    "item_popularity_score",
    "storage_location_id",
    "zone",
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
    "reorder_point_gap",
    "days_of_inventory",
    "restock_month",
    "restock_quarter",
    "restock_dayofweek",
]


CATEGORICAL_FEATURES = [
    "category",
    "storage_location_id",
    "zone",
]


SERVICE_LEVEL_Z = 1.645


# ==========================================================
# PREPARE LOGISTICS CSV
# ==========================================================

def prepare_logistics_csv(
    file_bytes: bytes,
):
    df = pd.read_csv(
        BytesIO(file_bytes)
    )


    # ------------------------------------------------------
    # VALIDATE REQUIRED COLUMNS
    # ------------------------------------------------------

    missing_columns = [
        column
        for column in REQUIRED_RAW_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing required CSV columns: "
            + ", ".join(
                missing_columns
            )
        )


    # ------------------------------------------------------
    # CLEAN
    # ------------------------------------------------------

    df = (
        df
        .drop_duplicates()
        .copy()
    )


    df["last_restock_date"] = pd.to_datetime(
        df["last_restock_date"],
        errors="coerce",
    )


    numeric_columns = [
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
    ]


    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )


    df = df.dropna(
        subset=[
            "category",
            "storage_location_id",
            "zone",
            "last_restock_date",
            *numeric_columns,
        ]
    ).copy()


    if df.empty:
        raise ValueError(
            "The uploaded Logistics CSV "
            "does not contain valid records."
        )


    # ======================================================
    # DERIVED FEATURES
    # ======================================================

    df["inventory_value"] = (
        df["stock_level"]
        * df["unit_price"]
    )


    df["annual_holding_cost"] = (
        df["stock_level"]
        * df["holding_cost_per_unit_day"]
        * 365
    )


    df["lead_time_demand"] = (
        df["daily_demand"]
        * df["lead_time_days"]
    )


    df["safety_stock"] = (
        SERVICE_LEVEL_Z
        * df["demand_std_dev"]
        * np.sqrt(
            df["lead_time_days"]
        )
    )


    df["optimized_reorder_point"] = (
        df["lead_time_demand"]
        + df["safety_stock"]
    ).round()


    df["reorder_point_gap"] = (
        df["reorder_point"]
        - df["optimized_reorder_point"]
    )


    df["days_of_inventory"] = (
        df["stock_level"]
        / (
            df["daily_demand"]
            + 1e-6
        )
    )


    # ------------------------------------------------------
    # DATE FEATURES
    # ------------------------------------------------------

    df["restock_month"] = (
        df["last_restock_date"]
        .dt.month
    )


    df["restock_quarter"] = (
        df["last_restock_date"]
        .dt.quarter
    )


    df["restock_dayofweek"] = (
        df["last_restock_date"]
        .dt.dayofweek
    )


    df = df.replace(
        [
            np.inf,
            -np.inf,
        ],
        np.nan,
    )


    df = df.dropna(
        subset=MODEL_FEATURES
    ).copy()


    if df.empty:
        raise ValueError(
            "No valid Logistics rows remain "
            "after feature engineering."
        )


    return df


# ==========================================================
# BUILD LATEST MODEL INPUT
# ==========================================================

def build_latest_input(
    df: pd.DataFrame,
):
    latest_row = (
        df.sort_values(
            "last_restock_date"
        )
        .iloc[-1]
    )


    model_input = pd.DataFrame(
        [
            {
                feature:
                    latest_row[
                        feature
                    ]
                for feature
                in MODEL_FEATURES
            }
        ]
    )


    for column in CATEGORICAL_FEATURES:
        model_input[column] = (
            model_input[
                column
            ]
            .astype(str)
        )


    return (
        latest_row,
        model_input,
    )


# ==========================================================
# GENERATED FEATURES RESPONSE
# ==========================================================

def build_generated_features(
    latest_row,
):
    names = [
        "inventory_value",
        "annual_holding_cost",
        "lead_time_demand",
        "safety_stock",
        "optimized_reorder_point",
        "reorder_point_gap",
        "days_of_inventory",
        "restock_month",
        "restock_quarter",
        "restock_dayofweek",
    ]


    result = {}


    for feature in names:
        value = latest_row[
            feature
        ]


        if feature in [
            "restock_month",
            "restock_quarter",
            "restock_dayofweek",
        ]:
            result[
                feature
            ] = int(value)

        else:
            result[
                feature
            ] = float(value)


    return result


# ==========================================================
# COMMON RECORD INFO
# ==========================================================

def build_record(
    latest_row,
):
    record = {
        "category":
            str(
                latest_row[
                    "category"
                ]
            ),

        "storage_location_id":
            str(
                latest_row[
                    "storage_location_id"
                ]
            ),

        "zone":
            str(
                latest_row[
                    "zone"
                ]
            ),

        "date":
            latest_row[
                "last_restock_date"
            ].strftime(
                "%Y-%m-%d"
            ),
    }


    if (
        "item_id"
        in latest_row.index
    ):
        record[
            "item_id"
        ] = str(
            latest_row[
                "item_id"
            ]
        )


    return record


# ==========================================================
# LOGISTICS KPI CSV PREDICTION
# ==========================================================

def predict_logistics_kpi_from_csv(
    file_bytes: bytes,
):
    df = prepare_logistics_csv(
        file_bytes
    )


    latest_row, model_input = (
        build_latest_input(
            df
        )
    )


    model = load_pickle(
        MODEL_PATHS[
            "logistics_kpi_model"
        ]
    )


    prediction = float(
        model.predict(
            model_input
        )[0]
    )


    return {
        "model":
            "CatBoost KPI Estimator",

        "prediction_type":
            "kpi_estimation",

        "prediction":
            prediction,

        "source":
            "uploaded_csv",

        "record":
            build_record(
                latest_row
            ),

        "generated_features":
            build_generated_features(
                latest_row
            ),
    }


# ==========================================================
# STOCKOUT CSV PREDICTION
# ==========================================================

def predict_stockout_from_csv(
    file_bytes: bytes,
):
    df = prepare_logistics_csv(
        file_bytes
    )


    latest_row, model_input = (
        build_latest_input(
            df
        )
    )


    model = load_pickle(
        MODEL_PATHS[
            "logistics_stockout_model"
        ]
    )


    prediction = (
        model.predict(
            model_input
        )
        .flatten()
    )


    predicted_class = int(
        prediction[0]
    )


    probabilities = (
        model.predict_proba(
            model_input
        )[0]
    )


    stockout_probability = float(
        probabilities[1]
    )


    confidence = float(
        np.max(
            probabilities
        )
    )


    return {
        "model":
            "CatBoost Stockout Classifier",

        "prediction_type":
            "stockout_risk",

        "prediction":
            predicted_class,

        "confidence":
            confidence,

        "stockout_probability":
            stockout_probability,

        "source":
            "uploaded_csv",

        "record":
            build_record(
                latest_row
            ),

        "generated_features":
            build_generated_features(
                latest_row
            ),
    }