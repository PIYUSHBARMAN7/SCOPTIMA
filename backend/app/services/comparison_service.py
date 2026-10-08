from pathlib import Path

import numpy as np
import pandas as pd


BACKEND_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BACKEND_DIR / "data"


INVENTORY_FILE = (
    DATA_DIR
    / "logistics_inventory_optimization.csv"
)

STOCKOUT_FILE = (
    DATA_DIR
    / "logistics_stockout_predictions.csv"
)

FORECAST_FILE = (
    DATA_DIR
    / "prediction_history.csv"
)


# ==========================================================
# HELPERS
# ==========================================================

def normalize_columns(df: pd.DataFrame):
    df = df.copy()

    df.columns = [
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("/", "_")
        .replace("(", "")
        .replace(")", "")
        for column in df.columns
    ]

    return df


def numeric(df, column):
    if column not in df.columns:
        return pd.Series(
            0.0,
            index=df.index,
        )

    return pd.to_numeric(
        df[column],
        errors="coerce",
    ).fillna(0)


def safe_mean(series):
    if len(series) == 0:
        return 0.0

    return float(
        series.mean()
    )


def safe_sum(series):
    return float(
        series.sum()
    )


# ==========================================================
# OPTIONS
# ==========================================================

def get_comparison_options():

    warehouses = []
    products = []

    inventory_columns = []
    stockout_columns = []

    inventory_exists = (
        INVENTORY_FILE.exists()
    )

    stockout_exists = (
        STOCKOUT_FILE.exists()
    )


    # ======================================================
    # INVENTORY / WAREHOUSE
    # ======================================================

    if inventory_exists:

        inventory = pd.read_csv(
            INVENTORY_FILE
        )

        inventory = normalize_columns(
            inventory
        )

        inventory_columns = (
            inventory.columns.tolist()
        )


        warehouse_candidates = [
            "storage_location_id",
            "storage_location",
            "warehouse_id",
            "warehouse",
            "location_id",
            "location",
            "zone",
        ]


        warehouse_column = next(
            (
                column
                for column
                in warehouse_candidates
                if column in inventory.columns
            ),
            None,
        )


        if warehouse_column:

            warehouses = (
                inventory[
                    warehouse_column
                ]
                .dropna()
                .astype(str)
                .str.strip()
            )


            warehouses = warehouses[
                warehouses != ""
            ]


            warehouses = sorted(
                warehouses
                .unique()
                .tolist()
            )


    # ======================================================
    # STOCKOUT / PRODUCTS
    # ======================================================

    if stockout_exists:

        stockout = pd.read_csv(
            STOCKOUT_FILE
        )

        stockout = normalize_columns(
            stockout
        )

        stockout_columns = (
            stockout.columns.tolist()
        )


        product_candidates = [
            "item_id",
            "product_id",
            "sku_id",
            "sku",
            "product",
            "item",
        ]


        product_column = next(
            (
                column
                for column
                in product_candidates
                if column in stockout.columns
            ),
            None,
        )


        if product_column:

            products = (
                stockout[
                    product_column
                ]
                .dropna()
                .astype(str)
                .str.strip()
            )


            products = products[
                products != ""
            ]


            products = sorted(
                products
                .unique()
                .tolist()
            )


    print(
        "INVENTORY FILE:",
        INVENTORY_FILE,
    )

    print(
        "INVENTORY EXISTS:",
        inventory_exists,
    )

    print(
        "INVENTORY COLUMNS:",
        inventory_columns,
    )

    print(
        "WAREHOUSES:",
        warehouses[:20],
    )


    print(
        "STOCKOUT FILE:",
        STOCKOUT_FILE,
    )

    print(
        "STOCKOUT EXISTS:",
        stockout_exists,
    )

    print(
        "STOCKOUT COLUMNS:",
        stockout_columns,
    )

    print(
        "PRODUCTS:",
        products[:20],
    )


    return {
        "warehouses":
            warehouses,

        "products":
            products,

        "warehouse_count":
            len(warehouses),

        "product_count":
            len(products),

        # temporary diagnostics
        "inventory_file_exists":
            inventory_exists,

        "stockout_file_exists":
            stockout_exists,

        "inventory_columns":
            inventory_columns,

        "stockout_columns":
            stockout_columns,
    }
# ==========================================================
# WAREHOUSE METRICS
# ==========================================================

def warehouse_metrics(
    df: pd.DataFrame,
    warehouse_id: str,
):

    selected = df[
        df[
            "storage_location_id"
        ].astype(str)
        ==
        str(warehouse_id)
    ].copy()


    if selected.empty:
        raise ValueError(
            f"Warehouse '{warehouse_id}' was not found."
        )


    stock = numeric(
        selected,
        "stock_level",
    )

    safety = numeric(
        selected,
        "safety_stock",
    )

    excess = numeric(
        selected,
        "excess_stock",
    )

    inventory_value = numeric(
        selected,
        "inventory_value",
    )

    savings = numeric(
        selected,
        "potential_holding_cost_saving",
    )

    demand = numeric(
        selected,
        "daily_demand",
    )


    critical = int(
        (
            stock
            <
            safety
        ).sum()
    )


    return {
        "id":
            str(
                warehouse_id
            ),

        "total_items":
            int(
                len(
                    selected
                )
            ),

        "total_stock":
            round(
                safe_sum(
                    stock
                ),
                2,
            ),

        "average_daily_demand":
            round(
                safe_mean(
                    demand
                ),
                2,
            ),

        "inventory_value":
            round(
                safe_sum(
                    inventory_value
                ),
                2,
            ),

        "excess_stock":
            round(
                safe_sum(
                    excess
                ),
                2,
            ),

        "potential_savings":
            round(
                safe_sum(
                    savings
                ),
                2,
            ),

        "critical_items":
            critical,
    }


def compare_warehouses(
    warehouse_a: str,
    warehouse_b: str,
):

    if not INVENTORY_FILE.exists():
        raise FileNotFoundError(
            "Inventory optimization dataset was not found."
        )


    df = normalize_columns(
        pd.read_csv(
            INVENTORY_FILE
        )
    )


    if "storage_location_id" not in df.columns:
        raise ValueError(
            "storage_location_id column is unavailable."
        )


    return {
        "mode":
            "warehouse",

        "left":
            warehouse_metrics(
                df,
                warehouse_a,
            ),

        "right":
            warehouse_metrics(
                df,
                warehouse_b,
            ),
    }


# ==========================================================
# PRODUCT METRICS
# ==========================================================

def product_metrics(
    df: pd.DataFrame,
    product_id: str,
):

    selected = df[
        df[
            "item_id"
        ].astype(str)
        ==
        str(product_id)
    ].copy()


    if selected.empty:
        raise ValueError(
            f"Product '{product_id}' was not found."
        )


    stock = numeric(
        selected,
        "stock_level",
    )

    demand = numeric(
        selected,
        "daily_demand",
    )

    forecast = numeric(
        selected,
        "forecasted_demand_next_7d",
    )

    probability = numeric(
        selected,
        "stockout_probability",
    )


    if (
        len(probability)
        and probability.max() > 1
    ):
        probability = (
            probability / 100
        )


    savings = numeric(
        selected,
        "potential_holding_cost_saving",
    )


    return {
        "id":
            str(
                product_id
            ),

        "records":
            int(
                len(
                    selected
                )
            ),

        "stock_level":
            round(
                safe_mean(
                    stock
                ),
                2,
            ),

        "daily_demand":
            round(
                safe_mean(
                    demand
                ),
                2,
            ),

        "forecast_7d":
            round(
                safe_mean(
                    forecast
                ),
                2,
            ),

        "stockout_probability":
            round(
                safe_mean(
                    probability
                ),
                6,
            ),

        "potential_savings":
            round(
                safe_sum(
                    savings
                ),
                2,
            ),
    }


def compare_products(
    product_a: str,
    product_b: str,
):

    if not STOCKOUT_FILE.exists():
        raise FileNotFoundError(
            "Stockout predictions dataset was not found."
        )


    df = normalize_columns(
        pd.read_csv(
            STOCKOUT_FILE
        )
    )


    if "item_id" not in df.columns:
        raise ValueError(
            "item_id column is unavailable."
        )


    return {
        "mode":
            "product",

        "left":
            product_metrics(
                df,
                product_a,
            ),

        "right":
            product_metrics(
                df,
                product_b,
            ),
    }


# ==========================================================
# FORECAST HISTORY
# ==========================================================

def load_forecast_history():

    if not FORECAST_FILE.exists():
        raise FileNotFoundError(
            "Prediction history was not found."
        )


    df = normalize_columns(
        pd.read_csv(
            FORECAST_FILE
        )
    )


    if "date" not in df.columns:
        raise ValueError(
            "Prediction history does not contain a date column."
        )


    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce",
    )


    df = df[
        df[
            "date"
        ].notna()
    ].copy()


    return df.sort_values(
        "date"
    )


# ==========================================================
# ACTUAL VS FORECAST
# ==========================================================

def actual_vs_forecast():

    df = load_forecast_history()


    if (
        "actual_demand"
        not in df.columns
        or
        "forecast_demand"
        not in df.columns
    ):
        raise ValueError(
            "Actual and forecast demand columns are required."
        )


    actual = pd.to_numeric(
        df[
            "actual_demand"
        ],
        errors="coerce",
    )

    forecast = pd.to_numeric(
        df[
            "forecast_demand"
        ],
        errors="coerce",
    )


    valid = (
        actual.notna()
        &
        forecast.notna()
    )


    df = df[
        valid
    ].copy()


    actual = actual[
        valid
    ]

    forecast = forecast[
        valid
    ]


    points = []


    for (
        date,
        actual_value,
        forecast_value,
    ) in zip(
        df["date"],
        actual,
        forecast,
    ):

        points.append(
            {
                "date":
                    date.strftime(
                        "%Y-%m-%d"
                    ),

                "actual":
                    round(
                        float(
                            actual_value
                        ),
                        2,
                    ),

                "forecast":
                    round(
                        float(
                            forecast_value
                        ),
                        2,
                    ),
            }
        )


    error = (
        actual
        -
        forecast
    )


    mae = float(
        np.abs(
            error
        ).mean()
    ) if len(actual) else 0


    return {
        "mode":
            "actual_forecast",

        "summary": {
            "records":
                int(
                    len(
                        points
                    )
                ),

            "average_actual":
                round(
                    safe_mean(
                        actual
                    ),
                    2,
                ),

            "average_forecast":
                round(
                    safe_mean(
                        forecast
                    ),
                    2,
                ),

            "mae":
                round(
                    mae,
                    4,
                ),
        },

        "points":
            points,
    }


# ==========================================================
# CURRENT PERIOD VS PREVIOUS PERIOD
# ==========================================================

def current_vs_previous():

    df = load_forecast_history()


    if "actual_demand" not in df.columns:
        raise ValueError(
            "actual_demand is required for period comparison."
        )


    df[
        "actual_demand"
    ] = pd.to_numeric(
        df[
            "actual_demand"
        ],
        errors="coerce",
    )


    df = df[
        df[
            "actual_demand"
        ].notna()
    ].copy()


    if len(df) < 2:
        raise ValueError(
            "Not enough historical records for period comparison."
        )


    midpoint = (
        len(df)
        //
        2
    )


    previous = df.iloc[
        :midpoint
    ]


    current = df.iloc[
        midpoint:
    ]


    def period_metrics(
        period,
        label,
    ):

        values = period[
            "actual_demand"
        ]


        return {
            "label":
                label,

            "records":
                int(
                    len(
                        period
                    )
                ),

            "total_demand":
                round(
                    safe_sum(
                        values
                    ),
                    2,
                ),

            "average_demand":
                round(
                    safe_mean(
                        values
                    ),
                    2,
                ),

            "start_date":
                period[
                    "date"
                ]
                .min()
                .strftime(
                    "%Y-%m-%d"
                ),

            "end_date":
                period[
                    "date"
                ]
                .max()
                .strftime(
                    "%Y-%m-%d"
                ),
        }


    previous_metrics = (
        period_metrics(
            previous,
            "Previous Period",
        )
    )


    current_metrics = (
        period_metrics(
            current,
            "Current Period",
        )
    )


    previous_avg = (
        previous_metrics[
            "average_demand"
        ]
    )


    current_avg = (
        current_metrics[
            "average_demand"
        ]
    )


    change_percentage = (
        (
            current_avg
            -
            previous_avg
        )
        /
        previous_avg
        *
        100
        if previous_avg
        else 0
    )


    return {
        "mode":
            "period",

        "previous":
            previous_metrics,

        "current":
            current_metrics,

        "average_demand_change_percentage":
            round(
                change_percentage,
                2,
            ),
    }