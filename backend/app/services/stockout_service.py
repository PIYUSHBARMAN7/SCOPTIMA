from pathlib import Path

import numpy as np
import pandas as pd


BACKEND_DIR = Path(
    __file__
).resolve().parents[2]

DATA_DIR = BACKEND_DIR / "data"

STOCKOUT_FILE = (
    DATA_DIR
    / "logistics_stockout_predictions.csv"
)


def normalize_column_name(name: str):
    return (
        str(name)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("/", "_")
        .replace("(", "")
        .replace(")", "")
        .replace("%", "percent")
    )


def load_stockout_predictions():
    if not STOCKOUT_FILE.exists():
        raise FileNotFoundError(
            "logistics_stockout_predictions.csv was not found."
        )

    df = pd.read_csv(
        STOCKOUT_FILE
    )

    if df.empty:
        raise ValueError(
            "Stockout prediction dataset is empty."
        )

    df.columns = [
        normalize_column_name(
            column
        )
        for column in df.columns
    ]

    return df


def get_risk_level(
    probability: float,
):
    if probability >= 0.75:
        return "Critical"

    if probability >= 0.50:
        return "High"

    if probability >= 0.25:
        return "Medium"

    return "Low"


def get_stockout_risk_summary():
    df = load_stockout_predictions()


    required = [
        "actual_stockout_risk",
        "predicted_stockout_risk",
        "stockout_probability",
    ]


    missing = [
        column
        for column in required
        if column not in df.columns
    ]


    if missing:
        raise ValueError(
            "Missing stockout prediction columns: "
            + ", ".join(
                missing
            )
        )


    df[
        "actual_stockout_risk"
    ] = pd.to_numeric(
        df[
            "actual_stockout_risk"
        ],
        errors="coerce",
    ).fillna(0).astype(int)


    df[
        "predicted_stockout_risk"
    ] = pd.to_numeric(
        df[
            "predicted_stockout_risk"
        ],
        errors="coerce",
    ).fillna(0).astype(int)


    probability = pd.to_numeric(
        df[
            "stockout_probability"
        ],
        errors="coerce",
    ).fillna(0)


    if (
        not probability.empty
        and probability.max() > 1
    ):
        probability = (
            probability / 100
        )


    probability = probability.clip(
        lower=0,
        upper=1,
    )


    df[
        "stockout_probability"
    ] = probability


    if "confidence" in df.columns:

        confidence = pd.to_numeric(
            df["confidence"],
            errors="coerce",
        )


        if (
            not confidence.dropna().empty
            and confidence.dropna().max() > 1
        ):
            confidence = (
                confidence / 100
            )


        confidence = (
            confidence
            .fillna(
                np.maximum(
                    probability,
                    1 - probability,
                )
            )
            .clip(
                0,
                1,
            )
        )

    else:

        confidence = np.maximum(
            probability,
            1 - probability,
        )


    df["confidence"] = confidence


    df["risk_level"] = [
        get_risk_level(
            float(value)
        )
        for value
        in probability
    ]


    df["prediction_correct"] = (
        df[
            "actual_stockout_risk"
        ]
        ==
        df[
            "predicted_stockout_risk"
        ]
    )


    total_items = int(
        len(df)
    )


    predicted_stockouts = int(
        (
            df[
                "predicted_stockout_risk"
            ]
            == 1
        ).sum()
    )


    actual_stockouts = int(
        (
            df[
                "actual_stockout_risk"
            ]
            == 1
        ).sum()
    )


    correct_predictions = int(
        df[
            "prediction_correct"
        ].sum()
    )


    calculated_accuracy = (
        correct_predictions /
        total_items
        if total_items > 0
        else 0
    )


    critical_count = int(
        (
            df[
                "risk_level"
            ]
            == "Critical"
        ).sum()
    )


    high_count = int(
        (
            df[
                "risk_level"
            ]
            == "High"
        ).sum()
    )


    medium_count = int(
        (
            df[
                "risk_level"
            ]
            == "Medium"
        ).sum()
    )


    low_count = int(
        (
            df[
                "risk_level"
            ]
            == "Low"
        ).sum()
    )


    average_probability = float(
        df[
            "stockout_probability"
        ].mean()
    )


    average_confidence = float(
        df[
            "confidence"
        ].mean()
    )


    # ======================================================
    # CONFUSION MATRIX
    # ======================================================

    true_positive = int(
        (
            (
                df[
                    "actual_stockout_risk"
                ]
                == 1
            )
            &
            (
                df[
                    "predicted_stockout_risk"
                ]
                == 1
            )
        ).sum()
    )


    true_negative = int(
        (
            (
                df[
                    "actual_stockout_risk"
                ]
                == 0
            )
            &
            (
                df[
                    "predicted_stockout_risk"
                ]
                == 0
            )
        ).sum()
    )


    false_positive = int(
        (
            (
                df[
                    "actual_stockout_risk"
                ]
                == 0
            )
            &
            (
                df[
                    "predicted_stockout_risk"
                ]
                == 1
            )
        ).sum()
    )


    false_negative = int(
        (
            (
                df[
                    "actual_stockout_risk"
                ]
                == 1
            )
            &
            (
                df[
                    "predicted_stockout_risk"
                ]
                == 0
            )
        ).sum()
    )


    df = (
        df
        .sort_values(
            "stockout_probability",
            ascending=False,
        )
        .head(100)
    )


    records = []


    for index, row in df.iterrows():

        record = {
            "row_id":
                int(index),

            "actual_stockout_risk":
                int(
                    row[
                        "actual_stockout_risk"
                    ]
                ),

            "predicted_stockout_risk":
                int(
                    row[
                        "predicted_stockout_risk"
                    ]
                ),

            "prediction_correct":
                bool(
                    row[
                        "prediction_correct"
                    ]
                ),

            "stockout_probability":
                float(
                    row[
                        "stockout_probability"
                    ]
                ),

            "confidence":
                float(
                    row[
                        "confidence"
                    ]
                ),

            "risk_level":
                str(
                    row[
                        "risk_level"
                    ]
                ),
        }


        optional_columns = [
            "category",
            "storage_location_id",
            "zone",
            "stock_level",
            "reorder_point",
            "safety_stock",
            "optimized_reorder_point",
            "daily_demand",
            "forecasted_demand_next_7d",
            "days_of_inventory",
            "item_id",
        ]


        for column in optional_columns:

            if column in row.index:

                value = row[
                    column
                ]


                if pd.isna(
                    value
                ):
                    value = None


                elif isinstance(
                    value,
                    (
                        int,
                        float,
                        np.integer,
                        np.floating,
                    ),
                ):
                    value = float(
                        value
                    )


                else:
                    value = str(
                        value
                    )


                record[
                    column
                ] = value


        records.append(
            record
        )


    return {
        "summary": {
            "total_items":
                total_items,

            "actual_stockouts":
                actual_stockouts,

            "predicted_stockouts":
                predicted_stockouts,

            "correct_predictions":
                correct_predictions,

            "calculated_accuracy":
                round(
                    calculated_accuracy,
                    6,
                ),

            "critical":
                critical_count,

            "high":
                high_count,

            "medium":
                medium_count,

            "low":
                low_count,

            "average_probability":
                round(
                    average_probability,
                    6,
                ),

            "average_confidence":
                round(
                    average_confidence,
                    6,
                ),

            "true_positive":
                true_positive,

            "true_negative":
                true_negative,

            "false_positive":
                false_positive,

            "false_negative":
                false_negative,

            "model_accuracy":
                0.996880,

            "model_precision":
                0.998331,

            "model_recall":
                0.998331,

            "model_f1":
                0.998331,
        },


        "model": {
            "name":
                "CatBoost Stockout Classifier",

            "status":
                "active",

            "source":
                "logistics_stockout_predictions.csv",
        },


        "records":
            records,
    }