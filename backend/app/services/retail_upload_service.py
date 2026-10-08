from io import BytesIO

import numpy as np
import pandas as pd

from app.services.model_service import (
    MODEL_PATHS,
    load_pickle,
)


# ==========================================================
# RAW CSV COLUMNS NEEDED
# ==========================================================

REQUIRED_RAW_COLUMNS = [
    "Date",
    "Store ID",
    "Product ID",
    "Category",
    "Region",
    "Weather Condition",
    "Seasonality",
    "Units Sold",
    "Units Ordered",
    "Inventory Level",
    "Demand Forecast",
    "Price",
    "Discount",
    "Competitor Pricing",
    "Holiday/Promotion",
]


# ==========================================================
# MODEL FEATURES
# ==========================================================

MODEL_FEATURES = [
    "Store ID",
    "Product ID",
    "Category",
    "Region",
    "Weather Condition",
    "Seasonality",
    "Demand Forecast",
    "Price",
    "Discount",
    "Effective_Price",
    "Competitor Pricing",
    "Price_Gap",
    "Price_Ratio",
    "Holiday/Promotion",
    "Inventory_Lag_1",
    "OrderQty_Lag_1",
    "Inventory_Cover_Days",
    "Year",
    "Month",
    "DayOfMonth",
    "DayOfWeek",
    "WeekOfYear",
    "Quarter",
    "IsWeekend",
    "DOW_sin",
    "DOW_cos",
    "Month_sin",
    "Month_cos",
    "Sales_Lag_1",
    "Sales_Lag_2",
    "Sales_Lag_3",
    "Sales_Lag_7",
    "Sales_Lag_14",
    "Sales_Lag_21",
    "Sales_Lag_28",
    "Sales_Lag_30",
    "Roll_Mean_7",
    "Roll_Mean_14",
    "Roll_Mean_28",
    "Roll_Mean_30",
    "Roll_Std_7",
    "Roll_Std_14",
    "Roll_Std_28",
    "Roll_Std_30",
    "Roll_Min_7",
    "Roll_Max_7",
    "Demand_Momentum_7_30",
]


CATEGORICAL_FEATURES = [
    "Store ID",
    "Product ID",
    "Category",
    "Region",
    "Weather Condition",
    "Seasonality",
]


# ==========================================================
# PREPARE RETAIL CSV
# ==========================================================

def prepare_retail_csv(
    file_bytes: bytes,
):
    # ------------------------------------------------------
    # READ
    # ------------------------------------------------------

    df = pd.read_csv(
        BytesIO(file_bytes)
    )


    # ------------------------------------------------------
    # VALIDATE COLUMNS
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


    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce",
    )


    numeric_columns = [
        "Units Sold",
        "Units Ordered",
        "Inventory Level",
        "Demand Forecast",
        "Price",
        "Discount",
        "Competitor Pricing",
        "Holiday/Promotion",
    ]


    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )


    df = df.dropna(
        subset=[
            "Date",
            "Store ID",
            "Product ID",
            "Units Sold",
            "Units Ordered",
            "Inventory Level",
            "Demand Forecast",
            "Price",
            "Discount",
            "Competitor Pricing",
        ]
    ).copy()


    # ------------------------------------------------------
    # SORT
    # ------------------------------------------------------

    df = df.sort_values(
        [
            "Store ID",
            "Product ID",
            "Date",
        ]
    ).reset_index(
        drop=True
    )


    group_columns = [
        "Store ID",
        "Product ID",
    ]


    # ======================================================
    # CALENDAR FEATURES
    # ======================================================

    df["Year"] = (
        df["Date"].dt.year
    )

    df["Month"] = (
        df["Date"].dt.month
    )

    df["DayOfMonth"] = (
        df["Date"].dt.day
    )

    df["DayOfWeek"] = (
        df["Date"].dt.dayofweek
    )

    df["WeekOfYear"] = (
        df["Date"]
        .dt
        .isocalendar()
        .week
        .astype(int)
    )

    df["Quarter"] = (
        df["Date"].dt.quarter
    )

    df["IsWeekend"] = (
        df["DayOfWeek"] >= 5
    ).astype(int)


    df["DOW_sin"] = np.sin(
        2
        * np.pi
        * df["DayOfWeek"]
        / 7
    )


    df["DOW_cos"] = np.cos(
        2
        * np.pi
        * df["DayOfWeek"]
        / 7
    )


    df["Month_sin"] = np.sin(
        2
        * np.pi
        * df["Month"]
        / 12
    )


    df["Month_cos"] = np.cos(
        2
        * np.pi
        * df["Month"]
        / 12
    )


    # ======================================================
    # PRICE FEATURES
    # ======================================================

    df["Effective_Price"] = (
        df["Price"]
        * (
            1
            - df["Discount"]
            / 100
        )
    )


    df["Price_Gap"] = (
        df["Price"]
        - df[
            "Competitor Pricing"
        ]
    )


    df["Price_Ratio"] = (
        df["Price"]
        / df[
            "Competitor Pricing"
        ]
    )


    df["Price_Ratio"] = (
        df["Price_Ratio"]
        .replace(
            [
                np.inf,
                -np.inf,
            ],
            np.nan,
        )
    )


    # ======================================================
    # SALES LAGS
    # ======================================================

    lag_values = [
        1,
        2,
        3,
        7,
        14,
        21,
        28,
        30,
    ]


    for lag in lag_values:

        df[
            f"Sales_Lag_{lag}"
        ] = (
            df.groupby(
                group_columns
            )["Units Sold"]
            .shift(lag)
        )


    # ======================================================
    # ROLLING FEATURES
    # ======================================================

    rolling_windows = [
        7,
        14,
        28,
        30,
    ]


    for window in rolling_windows:

        df[
            f"Roll_Mean_{window}"
        ] = (
            df.groupby(
                group_columns
            )["Units Sold"]
            .transform(
                lambda values:
                    values
                    .shift(1)
                    .rolling(
                        window
                    )
                    .mean()
            )
        )


        df[
            f"Roll_Std_{window}"
        ] = (
            df.groupby(
                group_columns
            )["Units Sold"]
            .transform(
                lambda values:
                    values
                    .shift(1)
                    .rolling(
                        window
                    )
                    .std()
            )
        )


    # ======================================================
    # MIN / MAX
    # ======================================================

    df["Roll_Min_7"] = (
        df.groupby(
            group_columns
        )["Units Sold"]
        .transform(
            lambda values:
                values
                .shift(1)
                .rolling(7)
                .min()
        )
    )


    df["Roll_Max_7"] = (
        df.groupby(
            group_columns
        )["Units Sold"]
        .transform(
            lambda values:
                values
                .shift(1)
                .rolling(7)
                .max()
        )
    )


    # ======================================================
    # INVENTORY FEATURES
    # ======================================================

    df["Inventory_Lag_1"] = (
        df.groupby(
            group_columns
        )["Inventory Level"]
        .shift(1)
    )


    df["OrderQty_Lag_1"] = (
        df.groupby(
            group_columns
        )["Units Ordered"]
        .shift(1)
    )


    df[
        "Inventory_Cover_Days"
    ] = (
        df["Inventory_Lag_1"]
        / (
            df["Roll_Mean_7"]
            + 1
        )
    )


    # ======================================================
    # DEMAND MOMENTUM
    # ======================================================

    df[
        "Demand_Momentum_7_30"
    ] = (
        df["Roll_Mean_7"]
        - df["Roll_Mean_30"]
    )


    # ======================================================
    # REMOVE INVALID VALUES
    # ======================================================

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
            "The uploaded Retail CSV does not "
            "contain enough historical data to "
            "generate the required lag and rolling "
            "features. At least 30 historical records "
            "are required for each Store/Product combination."
        )


    return df


# ==========================================================
# RETAIL PREDICTION
# ==========================================================

def predict_retail_from_csv(
    file_bytes: bytes,
):
    df = prepare_retail_csv(
        file_bytes
    )


    model = load_pickle(
        MODEL_PATHS[
            "retail_model"
        ]
    )


    preprocessor = load_pickle(
        MODEL_PATHS[
            "retail_preprocessor"
        ]
    )


    # ------------------------------------------------------
    # LATEST VALID RECORD
    # ------------------------------------------------------

    latest_row = (
        df.sort_values(
            "Date"
        )
        .iloc[-1]
    )


    # ------------------------------------------------------
    # BUILD MODEL INPUT
    # ------------------------------------------------------

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


    # ------------------------------------------------------
    # CATEGORY TYPES
    # ------------------------------------------------------

    for column in CATEGORICAL_FEATURES:

        model_input[
            column
        ] = (
            model_input[
                column
            ].astype(str)
        )


    # ------------------------------------------------------
    # PREPROCESS
    # ------------------------------------------------------

    transformed_data = (
        preprocessor.transform(
            model_input
        )
    )


    # ------------------------------------------------------
    # PREDICT
    # ------------------------------------------------------

    prediction = float(
        model.predict(
            transformed_data
        )[0]
    )


    # ------------------------------------------------------
    # IMPORTANT GENERATED FEATURES
    # ------------------------------------------------------

    generated_feature_names = [
        "Effective_Price",
        "Price_Gap",
        "Price_Ratio",
        "Inventory_Lag_1",
        "OrderQty_Lag_1",
        "Inventory_Cover_Days",
        "Sales_Lag_1",
        "Sales_Lag_7",
        "Sales_Lag_30",
        "Roll_Mean_7",
        "Roll_Mean_30",
        "Roll_Std_7",
        "Demand_Momentum_7_30",
        "Month",
        "DayOfWeek",
        "IsWeekend",
    ]


    generated_features = {}

    for feature in generated_feature_names:

        value = latest_row[
            feature
        ]


        if feature in [
            "Month",
            "DayOfWeek",
            "IsWeekend",
        ]:

            generated_features[
                feature
            ] = int(
                value
            )

        else:

            generated_features[
                feature
            ] = float(
                value
            )


    # ------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------

    return {
        "model":
            "HistGradientBoostingRegressor",

        "prediction_type":
            "retail_demand_forecast",

        "prediction":
            prediction,

        "source":
            "uploaded_csv",

        "record": {
            "store_id":
                str(
                    latest_row[
                        "Store ID"
                    ]
                ),

            "product_id":
                str(
                    latest_row[
                        "Product ID"
                    ]
                ),

            "category":
                str(
                    latest_row[
                        "Category"
                    ]
                ),

            "region":
                str(
                    latest_row[
                        "Region"
                    ]
                ),

            "date":
                latest_row[
                    "Date"
                ].strftime(
                    "%Y-%m-%d"
                ),
        },

        "generated_features":
            generated_features,
    }