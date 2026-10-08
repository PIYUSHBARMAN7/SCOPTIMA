import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  CircleDollarSign,
  PackageCheck,
  PackageX,
} from "lucide-react";

import {
  getInventoryOptimization,
  type InventoryOptimizationRecord,
  type InventoryOptimizationResponse,
} from "../services/dashboardApi";


export default function InventoryPage() {
  const [
    data,
    setData,
  ] =
    useState<
      InventoryOptimizationResponse | null
    >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("All");


  const [
    search,
    setSearch,
  ] =
    useState("");


  useEffect(() => {
    const loadInventory =
      async () => {

        try {
          setLoading(
            true
          );

          setError(
            ""
          );


          const result =
            await getInventoryOptimization();


          setData(
            result
          );

        } catch (err) {

          console.error(
            "Inventory page error:",
            err
          );


          setError(
            "Unable to load inventory optimization data."
          );

        } finally {

          setLoading(
            false
          );

        }

      };


    loadInventory();

  }, []);


  const formatCurrency =
    (
      value:
        number |
        null |
        undefined
    ) => {

      if (
        value === null ||
        value === undefined
      ) {
        return "—";
      }


      return `₹${value.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits:
            0,
        }
      )}`;
    };


  const formatNumber =
    (
      value:
        number |
        null |
        undefined
    ) => {

      if (
        value === null ||
        value === undefined
      ) {
        return "—";
      }


      return value.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits:
            2,
        }
      );
    };


  const filteredRecords =
    useMemo(
      () => {

        const records =
          data?.records ??
          [];


        return records.filter(
          (
            record
          ) => {

            const matchesStatus =
              statusFilter ===
                "All" ||
              record.inventory_status ===
                statusFilter;


            const searchValue =
              search
                .trim()
                .toLowerCase();


            if (
              !searchValue
            ) {
              return matchesStatus;
            }


            const searchable =
              [
                record.category,
                record.storage_location_id,
                record.zone,
                record.inventory_status,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase();


            return (
              matchesStatus &&
              searchable.includes(
                searchValue
              )
            );
          }
        );

      },
      [
        data,
        statusFilter,
        search,
      ]
    );


  const getStatusClass =
    (
      status:
        string |
        undefined
    ) => {

      if (
        status ===
        "Healthy"
      ) {
        return "healthy";
      }


      if (
        status ===
        "Low Stock"
      ) {
        return "low";
      }


      if (
        status ===
        "Critical"
      ) {
        return "critical";
      }


      if (
        status ===
        "Excess"
      ) {
        return "excess";
      }


      return "";
    };


  const summary =
    data?.summary;


  return (
    <div className="inventory-page">


      {/* HEADER */}

      <section className="inventory-page-header">

        <div>

          <span className="dashboard-eyebrow">
            INVENTORY INTELLIGENCE
          </span>


          <h1>
            Inventory Optimization
          </h1>


          <p>
            Monitor inventory health,
            safety stock, optimized reorder
            points, excess inventory and
            savings opportunities.
          </p>

        </div>

      </section>


      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* KPI CARDS */}

      <section className="inventory-kpi-grid">


        <article className="inventory-kpi-card">

          <div className="inventory-kpi-icon">

            <Boxes
              size={18}
            />

          </div>


          <span>
            TRACKED ITEMS
          </span>


          <strong>

            {loading
              ? "..."
              : summary
              ? summary.total_items.toLocaleString(
                  "en-IN"
                )
              : "—"}

          </strong>


          <p>
            Inventory records analyzed
          </p>

        </article>


        <article className="inventory-kpi-card">

          <div className="inventory-kpi-icon healthy">

            <PackageCheck
              size={18}
            />

          </div>


          <span>
            HEALTHY
          </span>


          <strong>

            {loading
              ? "..."
              : summary?.healthy ??
                "—"}

          </strong>


          <p>
            Inventory within target range
          </p>

        </article>


        <article className="inventory-kpi-card">

          <div className="inventory-kpi-icon critical">

            <PackageX
              size={18}
            />

          </div>


          <span>
            CRITICAL
          </span>


          <strong>

            {loading
              ? "..."
              : summary?.critical ??
                "—"}

          </strong>


          <p>
            Below safety stock
          </p>

        </article>


        <article className="inventory-kpi-card">

          <div className="inventory-kpi-icon">

            <CircleDollarSign
              size={18}
            />

          </div>


          <span>
            POTENTIAL SAVINGS
          </span>


          <strong>

            {loading
              ? "..."
              : formatCurrency(
                  summary
                    ?.potential_savings
                )}

          </strong>


          <p>
            Annual holding-cost opportunity
          </p>

        </article>

      </section>


      {/* SUMMARY */}

      <section className="inventory-optimization-grid">


        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                INVENTORY HEALTH
              </span>


              <h3>
                Stock Distribution
              </h3>

            </div>

          </div>


          <div className="inventory-health-breakdown">


            <div>

              <span className="inventory-health-dot healthy" />

              <p>
                Healthy
              </p>

              <strong>
                {summary?.healthy ?? "—"}
              </strong>

            </div>


            <div>

              <span className="inventory-health-dot low" />

              <p>
                Low Stock
              </p>

              <strong>
                {summary?.low_stock ?? "—"}
              </strong>

            </div>


            <div>

              <span className="inventory-health-dot critical" />

              <p>
                Critical
              </p>

              <strong>
                {summary?.critical ?? "—"}
              </strong>

            </div>


            <div>

              <span className="inventory-health-dot excess" />

              <p>
                Excess
              </p>

              <strong>
                {summary?.excess ?? "—"}
              </strong>

            </div>

          </div>

        </article>


        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                CAPITAL EFFICIENCY
              </span>


              <h3>
                Inventory Value
              </h3>

            </div>

          </div>


          <div className="inventory-value-summary">


            <div>

              <span>
                Total Inventory Value
              </span>

              <strong>
                {formatCurrency(
                  summary
                    ?.total_inventory_value
                )}
              </strong>

            </div>


            <div>

              <span>
                Excess Stock Units
              </span>

              <strong>
                {formatNumber(
                  summary
                    ?.total_excess_stock
                )}
              </strong>

            </div>


            <div>

              <span>
                Potential Savings
              </span>

              <strong className="positive">
                {formatCurrency(
                  summary
                    ?.potential_savings
                )}
              </strong>

            </div>

          </div>

        </article>

      </section>


      {/* INVENTORY TABLE */}

      <section className="dashboard-panel inventory-table-panel">


        <div className="inventory-table-header">

          <div>

            <span className="dashboard-eyebrow">
              OPTIMIZATION DETAIL
            </span>


            <h3>
              Inventory Recommendations
            </h3>

          </div>


          <div className="inventory-table-controls">

            <input
              type="text"

              value={
                search
              }

              placeholder="Search category, location, zone..."

              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
            />


            <select
              value={
                statusFilter
              }

              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Healthy">
                Healthy
              </option>

              <option value="Low Stock">
                Low Stock
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="Excess">
                Excess
              </option>

            </select>

          </div>

        </div>


        <div className="inventory-table-wrapper">

          <table className="inventory-optimization-table">

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th>
                  Location
                </th>

                <th>
                  Zone
                </th>

                <th>
                  Current Stock
                </th>

                <th>
                  Safety Stock
                </th>

                <th>
                  Optimized ROP
                </th>

                <th>
                  Recommended
                </th>

                <th>
                  Excess
                </th>

                <th>
                  Inventory Value
                </th>

                <th>
                  Savings
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRecords.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={
                      11
                    }

                    className="inventory-empty-row"
                  >
                    No matching inventory records.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record:
                      InventoryOptimizationRecord,
                    index
                  ) => (

                    <tr
                      key={
                        `${record.storage_location_id}-${index}`
                      }
                    >

                      <td>
                        {record.category ??
                          "—"}
                      </td>


                      <td>
                        {record.storage_location_id ??
                          "—"}
                      </td>


                      <td>
                        {record.zone ??
                          "—"}
                      </td>


                      <td>
                        {formatNumber(
                          record.stock_level
                        )}
                      </td>


                      <td>
                        {formatNumber(
                          record.safety_stock
                        )}
                      </td>


                      <td>
                        {formatNumber(
                          record.optimized_reorder_point
                        )}
                      </td>


                      <td>
                        {formatNumber(
                          record.recommended_stock
                        )}
                      </td>


                      <td>
                        {formatNumber(
                          record.excess_stock
                        )}
                      </td>


                      <td>
                        {formatCurrency(
                          record.inventory_value
                        )}
                      </td>


                      <td className="inventory-savings-cell">
                        {formatCurrency(
                          record.potential_holding_cost_saving
                        )}
                      </td>


                      <td>

                        <span
                          className={`inventory-status-badge ${getStatusClass(
                            record.inventory_status
                          )}`}
                        >
                          {record.inventory_status ??
                            "—"}
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}