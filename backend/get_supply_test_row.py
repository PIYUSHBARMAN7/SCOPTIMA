import pandas as pd

# CHANGE THIS PATH to the processed Supply Chain CSV
CSV_PATH = "data/supply_chain_predictions.csv"

df = pd.read_csv(CSV_PATH)

required_features = [
    "SKU_ID",
    "Warehouse_ID",
    "Supplier_ID",
    "Region",
    "Supplier_Lead_Time_Days",
    "Reorder_Point",
    "Unit_Cost",
    "Unit_Price",
    "Promotion_Flag",
    "Demand_Forecast",
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
    "Inventory_Lag_1",
    "OrderQty_Lag_1",
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
]

missing = [
    col
    for col in required_features
    if col not in df.columns
]

if missing:
    print("MISSING COLUMNS:")
    print(missing)

else:
    row = df[required_features].dropna().iloc[0]

    print("\nCOPY THIS INTO SWAGGER:\n")

    print({
        "input_data": row.to_dict()
    })