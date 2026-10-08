from datetime import datetime

from app.services.cost_savings_service import (
    get_cost_savings_summary,
)

from app.services.inventory_service import (
    get_inventory_optimization_summary,
)

from app.services.model_performance_service import (
    get_model_performance_summary,
)

from app.services.prediction_history_service import (
    get_prediction_history,
)

from app.services.stockout_service import (
    get_stockout_risk_summary,
)


# ==========================================================
# REPORT SERVICE
# ==========================================================

def get_executive_report():
    inventory = (
        get_inventory_optimization_summary()
    )

    cost_savings = (
        get_cost_savings_summary()
    )

    stockout = (
        get_stockout_risk_summary()
    )

    model_performance = (
        get_model_performance_summary()
    )

    forecast_history = (
        get_prediction_history(
            limit=30
        )
    )


    # ======================================================
    # FORECAST SUMMARY
    # ======================================================

    valid_forecasts = [
        point
        for point in forecast_history
        if point.get(
            "forecast"
        ) is not None
    ]


    valid_actuals = [
        point
        for point in forecast_history
        if point.get(
            "actual"
        ) is not None
    ]


    latest_forecast = None

    if valid_forecasts:

        latest_forecast = (
            valid_forecasts[
                -1
            ][
                "forecast"
            ]
        )


    average_forecast = None

    if valid_forecasts:

        average_forecast = (
            sum(
                point[
                    "forecast"
                ]
                for point
                in valid_forecasts
            )
            /
            len(
                valid_forecasts
            )
        )


    average_actual = None

    if valid_actuals:

        average_actual = (
            sum(
                point[
                    "actual"
                ]
                for point
                in valid_actuals
            )
            /
            len(
                valid_actuals
            )
        )


    # ======================================================
    # EXECUTIVE SUMMARY
    # ======================================================

    inventory_summary = (
        inventory[
            "summary"
        ]
    )


    savings_summary = (
        cost_savings[
            "summary"
        ]
    )


    stockout_summary = (
        stockout[
            "summary"
        ]
    )


    performance_summary = (
        model_performance[
            "summary"
        ]
    )


    return {
        "generated_at":
            datetime.now().isoformat(),


        "executive_summary": {

            "tracked_inventory_items":
                inventory_summary[
                    "total_items"
                ],

            "healthy_items":
                inventory_summary[
                    "healthy"
                ],

            "low_stock_items":
                inventory_summary[
                    "low_stock"
                ],

            "critical_items":
                inventory_summary[
                    "critical"
                ],

            "excess_items":
                inventory_summary[
                    "excess"
                ],

            "total_inventory_value":
                inventory_summary[
                    "total_inventory_value"
                ],

            "potential_savings":
                savings_summary[
                    "potential_savings"
                ],

            "predicted_stockouts":
                stockout_summary[
                    "predicted_stockouts"
                ],

            "active_models":
                performance_summary[
                    "active_models"
                ],
        },


        "demand_forecast": {

            "records":
                len(
                    forecast_history
                ),

            "latest_forecast":
                latest_forecast,

            "average_forecast":
                average_forecast,

            "average_actual":
                average_actual,

            "history":
                forecast_history,
        },


        "inventory": {

            "summary":
                inventory_summary,

            "top_records":
                inventory[
                    "records"
                ][
                    :20
                ],
        },


        "stockout": {

            "summary":
                stockout_summary,

            "model":
                stockout[
                    "model"
                ],

            "top_risk_records":
                stockout[
                    "records"
                ][
                    :20
                ],
        },


        "cost_savings": {

            "summary":
                savings_summary,

            "categories":
                cost_savings[
                    "categories"
                ],

            "top_opportunities":
                cost_savings[
                    "records"
                ][
                    :20
                ],
        },


        "model_performance":
            model_performance,
    }