from io import BytesIO

import numpy as np
import pandas as pd

from app.services.model_service import (
    MODEL_PATHS,
    load_pickle,
)

from app.services.prediction_history_service import (
    save_prediction_history,
)


# ==========================================================
# MODEL FEATURES
# ==========================================================

MODEL_FEATURES = [
    "lag_1",
    "lag_7",
    "rolling_mean_7",
    "rolling_std_7",
    "rolling_mean_14",
    "day_of_week",
    "month",
    "day_of_month",
    "promotion_flag",
]


# ==========================================================
# FIND COLUMN
# ==========================================================

def find_column(
    df: pd.DataFrame,
    possible_names: list[str],
):
    for name in possible_names:
        if name in df.columns:
            return name

    return None


# ==========================================================
# PREPARE CSV
# ==========================================================

def prepare_supply_chain_csv(
    file_bytes: bytes,
):
    try:
        df = pd.read_csv(
            BytesIO(file_bytes)
        )

    except Exception as error:
        raise ValueError(
            f"Unable to read CSV file: {error}"
        )


    if df.empty:
        raise ValueError(
            "The uploaded CSV file is empty."
        )


    # ======================================================
    # DETECT RAW COLUMNS
    # ======================================================

    date_column = find_column(
        df,
        [
            "Date",
            "date",
        ],
    )


    sku_column = find_column(
        df,
        [
            "SKU_ID",
            "sku_id",
            "SKU",
            "sku",
        ],
    )


    warehouse_column = find_column(
        df,
        [
            "Warehouse_ID",
            "warehouse_id",
            "Warehouse",
            "warehouse",
        ],
    )


    units_column = find_column(
        df,
        [
            "Units_Sold",
            "units_sold",
            "Units Sold",
            "units sold",
            "Demand",
            "demand",
        ],
    )


    promotion_column = find_column(
        df,
        [
            "Promotion_Flag",
            "promotion_flag",
            "Promotion Flag",
            "promotion",
        ],
    )


    missing = []


    if date_column is None:
        missing.append(
            "Date"
        )


    if sku_column is None:
        missing.append(
            "SKU_ID"
        )


    if warehouse_column is None:
        missing.append(
            "Warehouse_ID"
        )


    if units_column is None:
        missing.append(
            "Units_Sold"
        )


    if promotion_column is None:
        missing.append(
            "Promotion_Flag"
        )


    if missing:
        raise ValueError(
            "Missing required CSV columns: "
            + ", ".join(
                missing
            )
        )


    # ======================================================
    # CLEAN DATA
    # ======================================================

    df = (
        df
        .drop_duplicates()
        .copy()
    )


    df[date_column] = pd.to_datetime(
        df[date_column],
        errors="coerce",
    )


    df[units_column] = pd.to_numeric(
        df[units_column],
        errors="coerce",
    )


    df[promotion_column] = pd.to_numeric(
        df[promotion_column],
        errors="coerce",
    )


    df = df.dropna(
        subset=[
            date_column,
            sku_column,
            warehouse_column,
            units_column,
        ]
    ).copy()


    if df.empty:
        raise ValueError(
            "No valid supply-chain records were found."
        )


    # ======================================================
    # SORT
    # ======================================================

    df = (
        df
        .sort_values(
            [
                sku_column,
                warehouse_column,
                date_column,
            ]
        )
        .copy()
    )


    group_columns = [
        sku_column,
        warehouse_column,
    ]


    # ======================================================
    # LAG FEATURES
    # ======================================================

    df["lag_1"] = (
        df
        .groupby(
            group_columns
        )[units_column]
        .shift(1)
    )


    df["lag_7"] = (
        df
        .groupby(
            group_columns
        )[units_column]
        .shift(7)
    )


    # ======================================================
    # ROLLING FEATURES
    # ======================================================

    df["rolling_mean_7"] = (
        df
        .groupby(
            group_columns
        )[units_column]
        .transform(
            lambda series:
                series
                .shift(1)
                .rolling(
                    window=7,
                    min_periods=7,
                )
                .mean()
        )
    )


    df["rolling_std_7"] = (
        df
        .groupby(
            group_columns
        )[units_column]
        .transform(
            lambda series:
                series
                .shift(1)
                .rolling(
                    window=7,
                    min_periods=7,
                )
                .std()
        )
    )


    df["rolling_mean_14"] = (
        df
        .groupby(
            group_columns
        )[units_column]
        .transform(
            lambda series:
                series
                .shift(1)
                .rolling(
                    window=14,
                    min_periods=14,
                )
                .mean()
        )
    )


    # ======================================================
    # CALENDAR FEATURES
    # ======================================================

    df["day_of_week"] = (
        df[date_column]
        .dt.dayofweek
    )


    df["month"] = (
        df[date_column]
        .dt.month
    )


    df["day_of_month"] = (
        df[date_column]
        .dt.day
    )


    # ======================================================
    # PROMOTION
    # ======================================================

    df["promotion_flag"] = (
        df[promotion_column]
        .fillna(0)
        .astype(float)
    )


    # ======================================================
    # CLEAN ENGINEERED DATA
    # ======================================================

    df = df.replace(
        [
            np.inf,
            -np.inf,
        ],
        np.nan,
    )


    valid_df = (
        df
        .dropna(
            subset=MODEL_FEATURES
        )
        .copy()
    )


    if valid_df.empty:
        raise ValueError(
            "Not enough historical data to generate model features. "
            "At least 14 historical rows are required for the same "
            "SKU and warehouse."
        )


    return {
        "data":
            valid_df,

        "date_column":
            date_column,

        "sku_column":
            sku_column,

        "warehouse_column":
            warehouse_column,

        "units_column":
            units_column,
    }


# ==========================================================
# MAIN CSV PREDICTION
# ==========================================================

def predict_supply_chain_from_csv(
    file_bytes: bytes,
):
    prepared = (
        prepare_supply_chain_csv(
            file_bytes
        )
    )


    df = prepared[
        "data"
    ]


    date_column = prepared[
        "date_column"
    ]


    sku_column = prepared[
        "sku_column"
    ]


    warehouse_column = prepared[
        "warehouse_column"
    ]


    units_column = prepared[
        "units_column"
    ]


    # ======================================================
    # LATEST VALID ROW
    # ======================================================

    latest_row = (
        df
        .sort_values(
            date_column
        )
        .iloc[-1]
    )


    # ======================================================
    # LOAD MODEL ARTIFACTS
    # ======================================================

    preprocessor = load_pickle(
        MODEL_PATHS[
            "supply_chain_preprocessor"
        ]
    )


    model = load_pickle(
        MODEL_PATHS[
            "supply_chain_model"
        ]
    )


    # ======================================================
    # LATEST ROW MODEL INPUT
    # ======================================================

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
        ],
        columns=MODEL_FEATURES,
    )


    # ======================================================
    # TRANSFORM
    # ======================================================

    transformed_input = (
        preprocessor.transform(
            model_input
        )
    )


    # ======================================================
    # PREDICT LATEST ROW
    # ======================================================

    prediction = float(
        model.predict(
            transformed_input
        )[0]
    )


    # ======================================================
    # SAVE MULTIPLE FORECAST HISTORY POINTS
    # ======================================================

    try:

        # --------------------------------------------------
        # TAKE MOST RECENT 20 VALID ROWS
        # --------------------------------------------------

        recent_rows = (
            df
            .sort_values(
                date_column
            )
            .tail(20)
            .copy()
        )


        # --------------------------------------------------
        # BUILD MODEL INPUT
        # --------------------------------------------------

        history_input = (
            recent_rows[
                MODEL_FEATURES
            ]
            .copy()
        )


        # --------------------------------------------------
        # TRANSFORM
        # --------------------------------------------------

        history_transformed = (
            preprocessor.transform(
                history_input
            )
        )


        # --------------------------------------------------
        # PREDICT ALL 20
        # --------------------------------------------------

        history_predictions = (
            model.predict(
                history_transformed
            )
        )


        # --------------------------------------------------
        # SAVE EACH POINT
        # --------------------------------------------------

        for (
            (_, history_row),
            history_prediction,
        ) in zip(
            recent_rows.iterrows(),
            history_predictions,
        ):

            history_date = (
                history_row[
                    date_column
                ].strftime(
                    "%Y-%m-%d"
                )
            )


            history_actual = float(
                history_row[
                    units_column
                ]
            )


            save_prediction_history(
                model_type=
                    "supply_chain",

                record_id=
                    str(
                        history_row[
                            sku_column
                        ]
                    ),

                location_id=
                    str(
                        history_row[
                            warehouse_column
                        ]
                    ),

                date=
                    history_date,

                actual_demand=
                    history_actual,

                forecast_demand=
                    float(
                        history_prediction
                    ),
            )


    except Exception as error:

        # History logging must never
        # break the actual prediction.

        print(
            "Prediction history save error:",
            repr(error),
        )


    # ======================================================
    # RESPONSE
    # ======================================================

    return {
        "model":
            "HistGradientBoostingRegressor",

        "prediction_type":
            "demand_forecast",

        "prediction":
            prediction,

        "source":
            "uploaded_csv",

        "record": {
            "sku_id":
                str(
                    latest_row[
                        sku_column
                    ]
                ),

            "warehouse_id":
                str(
                    latest_row[
                        warehouse_column
                    ]
                ),

            "date":
                latest_row[
                    date_column
                ].strftime(
                    "%Y-%m-%d"
                ),
        },

        "generated_features": {
            "lag_1":
                float(
                    latest_row[
                        "lag_1"
                    ]
                ),

            "lag_7":
                float(
                    latest_row[
                        "lag_7"
                    ]
                ),

            "rolling_mean_7":
                float(
                    latest_row[
                        "rolling_mean_7"
                    ]
                ),

            "rolling_std_7":
                float(
                    latest_row[
                        "rolling_std_7"
                    ]
                ),

            "rolling_mean_14":
                float(
                    latest_row[
                        "rolling_mean_14"
                    ]
                ),

            "day_of_week":
                int(
                    latest_row[
                        "day_of_week"
                    ]
                ),

            "month":
                int(
                    latest_row[
                        "month"
                    ]
                ),

            "day_of_month":
                int(
                    latest_row[
                        "day_of_month"
                    ]
                ),

            "promotion_flag":
                int(
                    latest_row[
                        "promotion_flag"
                    ]
                ),
        },
    }