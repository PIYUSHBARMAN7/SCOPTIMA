from pathlib import Path

import pandas as pd


BACKEND_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BACKEND_DIR
    / "data"
    / "logistics_inventory_optimization.csv"
)


def load_inventory_optimization_data():
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            "logistics_inventory_optimization.csv was not found."
        )

    df = pd.read_csv(DATA_FILE)

    if df.empty:
        raise ValueError(
            "Inventory optimization dataset is empty."
        )

    return df


def get_inventory_optimization_summary():
    df = load_inventory_optimization_data()

    numeric_columns = [
        "stock_level",
        "safety_stock",
        "optimized_reorder_point",
        "recommended_stock",
        "excess_stock",
        "inventory_value",
        "potential_holding_cost_saving",
    ]

    for column in numeric_columns:
        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce",
            ).fillna(0)

    total_items = len(df)

    total_inventory_value = float(
        df.get(
            "inventory_value",
            pd.Series(dtype=float),
        ).sum()
    )

    total_savings = float(
        df.get(
            "potential_holding_cost_saving",
            pd.Series(dtype=float),
        ).sum()
    )

    total_excess_stock = float(
        df.get(
            "excess_stock",
            pd.Series(dtype=float),
        ).sum()
    )

    critical_mask = (
        df["stock_level"]
        < df["safety_stock"]
    )

    low_stock_mask = (
        (df["stock_level"] >= df["safety_stock"])
        &
        (
            df["stock_level"]
            < df["optimized_reorder_point"]
        )
    )

    excess_mask = (
        df["excess_stock"] > 0
    )

    healthy_mask = (
        ~critical_mask
        &
        ~low_stock_mask
        &
        ~excess_mask
    )

    df["inventory_status"] = "Healthy"

    df.loc[
        low_stock_mask,
        "inventory_status",
    ] = "Low Stock"

    df.loc[
        critical_mask,
        "inventory_status",
    ] = "Critical"

    df.loc[
        excess_mask,
        "inventory_status",
    ] = "Excess"

    important_columns = [
        "category",
        "storage_location_id",
        "zone",
        "stock_level",
        "safety_stock",
        "optimized_reorder_point",
        "recommended_stock",
        "excess_stock",
        "inventory_value",
        "potential_holding_cost_saving",
        "inventory_status",
    ]

    available_columns = [
        column
        for column in important_columns
        if column in df.columns
    ]

    records_df = (
        df[available_columns]
        .sort_values(
            by="potential_holding_cost_saving"
            if "potential_holding_cost_saving"
            in df.columns
            else "stock_level",
            ascending=False,
        )
        .head(50)
    )

    records = []

    for _, row in records_df.iterrows():
        record = {}

        for column in available_columns:
            value = row[column]

            if pd.isna(value):
                value = None

            elif isinstance(
                value,
                (
                    int,
                    float,
                ),
            ):
                value = float(value)

            else:
                value = str(value)

            record[column] = value

        records.append(record)

    return {
        "summary": {
            "total_items":
                int(total_items),

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

            "total_inventory_value":
                round(
                    total_inventory_value,
                    2,
                ),

            "potential_savings":
                round(
                    total_savings,
                    2,
                ),

            "total_excess_stock":
                round(
                    total_excess_stock,
                    2,
                ),
        },

        "records":
            records,
    }