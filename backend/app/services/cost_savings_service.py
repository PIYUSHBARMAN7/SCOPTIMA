from pathlib import Path

import pandas as pd


# ==========================================================
# PATH
# ==========================================================

BACKEND_DIR = Path(
    __file__
).resolve().parents[2]


DATA_FILE = (
    BACKEND_DIR
    / "data"
    / "logistics_inventory_optimization.csv"
)


# ==========================================================
# LOAD DATA
# ==========================================================

def load_cost_savings_data():
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            "logistics_inventory_optimization.csv was not found."
        )


    df = pd.read_csv(
        DATA_FILE
    )


    if df.empty:
        raise ValueError(
            "Inventory optimization dataset is empty."
        )


    return df


# ==========================================================
# SAFE NUMERIC
# ==========================================================

def numeric_column(
    df: pd.DataFrame,
    column: str,
):
    if column not in df.columns:
        return pd.Series(
            0.0,
            index=df.index,
            dtype=float,
        )


    return pd.to_numeric(
        df[column],
        errors="coerce",
    ).fillna(0)


# ==========================================================
# SAFE TEXT
# ==========================================================

def text_column(
    df: pd.DataFrame,
    column: str,
    default: str = "Unknown",
):
    if column not in df.columns:
        return pd.Series(
            default,
            index=df.index,
            dtype="object",
        )


    return (
        df[column]
        .fillna(default)
        .astype(str)
    )


# ==========================================================
# MAIN COST SAVINGS SERVICE
# ==========================================================

def get_cost_savings_summary():
    df = load_cost_savings_data()


    # ======================================================
    # NORMALIZE IMPORTANT FIELDS
    # ======================================================

    df = df.copy()


    df["_category"] = text_column(
        df,
        "category",
    )


    df["_location"] = text_column(
        df,
        "storage_location_id",
    )


    df["_zone"] = text_column(
        df,
        "zone",
    )


    df["_stock_level"] = numeric_column(
        df,
        "stock_level",
    )


    df["_recommended_stock"] = numeric_column(
        df,
        "recommended_stock",
    )


    df["_excess_stock"] = numeric_column(
        df,
        "excess_stock",
    )


    df["_inventory_value"] = numeric_column(
        df,
        "inventory_value",
    )


    # ------------------------------------------------------
    # If excess_stock_value exists, use it.
    # Otherwise calculate from excess_stock * unit_price.
    # ------------------------------------------------------

    if "excess_stock_value" in df.columns:

        df["_excess_stock_value"] = numeric_column(
            df,
            "excess_stock_value",
        )

    else:

        unit_price = numeric_column(
            df,
            "unit_price",
        )


        df["_excess_stock_value"] = (
            df["_excess_stock"]
            *
            unit_price
        )


    # ------------------------------------------------------
    # Annual holding cost
    # ------------------------------------------------------

    if "annual_holding_cost" in df.columns:

        df["_annual_holding_cost"] = numeric_column(
            df,
            "annual_holding_cost",
        )

    else:

        holding_cost = numeric_column(
            df,
            "holding_cost_per_unit_day",
        )


        df["_annual_holding_cost"] = (
            df["_stock_level"]
            *
            holding_cost
            *
            365
        )


    # ------------------------------------------------------
    # Savings
    # ------------------------------------------------------

    df["_potential_savings"] = numeric_column(
        df,
        "potential_holding_cost_saving",
    )


    # ======================================================
    # TOTALS
    # ======================================================

    total_inventory_value = float(
        df[
            "_inventory_value"
        ].sum()
    )


    total_excess_stock = float(
        df[
            "_excess_stock"
        ].sum()
    )


    total_excess_value = float(
        df[
            "_excess_stock_value"
        ].sum()
    )


    total_holding_cost = float(
        df[
            "_annual_holding_cost"
        ].sum()
    )


    potential_savings = float(
        df[
            "_potential_savings"
        ].sum()
    )


    items_with_savings = int(
        (
            df[
                "_potential_savings"
            ]
            > 0
        ).sum()
    )


    savings_rate = (
        potential_savings /
        total_holding_cost
        if total_holding_cost > 0
        else 0
    )


    excess_value_rate = (
        total_excess_value /
        total_inventory_value
        if total_inventory_value > 0
        else 0
    )


    # ======================================================
    # CATEGORY SUMMARY
    # ======================================================

    category_df = (
        df
        .groupby(
            "_category",
            as_index=False,
        )
        .agg(
            inventory_value=(
                "_inventory_value",
                "sum",
            ),

            excess_stock=(
                "_excess_stock",
                "sum",
            ),

            excess_value=(
                "_excess_stock_value",
                "sum",
            ),

            annual_holding_cost=(
                "_annual_holding_cost",
                "sum",
            ),

            potential_savings=(
                "_potential_savings",
                "sum",
            ),

            item_count=(
                "_category",
                "size",
            ),
        )
        .sort_values(
            "potential_savings",
            ascending=False,
        )
    )


    categories = []


    for _, row in category_df.iterrows():

        categories.append(
            {
                "category":
                    str(
                        row[
                            "_category"
                        ]
                    ),

                "item_count":
                    int(
                        row[
                            "item_count"
                        ]
                    ),

                "inventory_value":
                    round(
                        float(
                            row[
                                "inventory_value"
                            ]
                        ),
                        2,
                    ),

                "excess_stock":
                    round(
                        float(
                            row[
                                "excess_stock"
                            ]
                        ),
                        2,
                    ),

                "excess_value":
                    round(
                        float(
                            row[
                                "excess_value"
                            ]
                        ),
                        2,
                    ),

                "annual_holding_cost":
                    round(
                        float(
                            row[
                                "annual_holding_cost"
                            ]
                        ),
                        2,
                    ),

                "potential_savings":
                    round(
                        float(
                            row[
                                "potential_savings"
                            ]
                        ),
                        2,
                    ),
            }
        )


    # ======================================================
    # TOP OPPORTUNITIES
    # ======================================================

    priority_df = (
        df
        .sort_values(
            "_potential_savings",
            ascending=False,
        )
        .head(100)
    )


    records = []


    for index, row in priority_df.iterrows():

        records.append(
            {
                "row_id":
                    int(index),

                "category":
                    str(
                        row[
                            "_category"
                        ]
                    ),

                "storage_location_id":
                    str(
                        row[
                            "_location"
                        ]
                    ),

                "zone":
                    str(
                        row[
                            "_zone"
                        ]
                    ),

                "stock_level":
                    round(
                        float(
                            row[
                                "_stock_level"
                            ]
                        ),
                        2,
                    ),

                "recommended_stock":
                    round(
                        float(
                            row[
                                "_recommended_stock"
                            ]
                        ),
                        2,
                    ),

                "excess_stock":
                    round(
                        float(
                            row[
                                "_excess_stock"
                            ]
                        ),
                        2,
                    ),

                "inventory_value":
                    round(
                        float(
                            row[
                                "_inventory_value"
                            ]
                        ),
                        2,
                    ),

                "excess_stock_value":
                    round(
                        float(
                            row[
                                "_excess_stock_value"
                            ]
                        ),
                        2,
                    ),

                "annual_holding_cost":
                    round(
                        float(
                            row[
                                "_annual_holding_cost"
                            ]
                        ),
                        2,
                    ),

                "potential_savings":
                    round(
                        float(
                            row[
                                "_potential_savings"
                            ]
                        ),
                        2,
                    ),
            }
        )


    # ======================================================
    # RESPONSE
    # ======================================================

    return {
        "summary": {
            "total_items":
                int(
                    len(df)
                ),

            "items_with_savings":
                items_with_savings,

            "total_inventory_value":
                round(
                    total_inventory_value,
                    2,
                ),

            "total_excess_stock":
                round(
                    total_excess_stock,
                    2,
                ),

            "total_excess_value":
                round(
                    total_excess_value,
                    2,
                ),

            "annual_holding_cost":
                round(
                    total_holding_cost,
                    2,
                ),

            "potential_savings":
                round(
                    potential_savings,
                    2,
                ),

            "savings_rate":
                round(
                    savings_rate,
                    6,
                ),

            "excess_value_rate":
                round(
                    excess_value_rate,
                    6,
                ),
        },

        "categories":
            categories,

        "records":
            records,
    }