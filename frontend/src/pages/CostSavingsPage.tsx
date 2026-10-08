import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  Boxes,
  CircleDollarSign,
  PiggyBank,
} from "lucide-react";

import {
  getCostSavings,
  type CostSavingsRecord,
  type CostSavingsResponse,
} from "../services/dashboardApi";


export default function CostSavingsPage() {
  const [
    data,
    setData,
  ] =
    useState<
      CostSavingsResponse | null
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
    search,
    setSearch,
  ] =
    useState("");


  // ========================================================
  // LOAD
  // ========================================================

  useEffect(() => {
    const load =
      async () => {

        try {

          setLoading(
            true
          );


          setError(
            ""
          );


          const response =
            await getCostSavings();


          setData(
            response
          );


        } catch (err) {

          console.error(
            "Cost savings error:",
            err
          );


          setError(
            "Unable to load cost savings intelligence."
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    load();

  }, []);


  // ========================================================
  // HELPERS
  // ========================================================

  const money =
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


  const number =
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


  const percent =
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


      return `${(
        value *
        100
      ).toFixed(
        2
      )}%`;
    };


  // ========================================================
  // FILTER
  // ========================================================

  const filteredRecords =
    useMemo(
      () => {

        const records =
          data?.records ??
          [];


        const query =
          search
            .trim()
            .toLowerCase();


        if (!query) {
          return records;
        }


        return records.filter(
          (
            record
          ) => {

            const searchable =
              [
                record.category,
                record.storage_location_id,
                record.zone,
              ]
                .join(
                  " "
                )
                .toLowerCase();


            return searchable.includes(
              query
            );

          }
        );

      },
      [
        data,
        search,
      ]
    );


  const summary =
    data?.summary;


  const maxCategorySavings =
    useMemo(
      () => {

        if (
          !data?.categories
            .length
        ) {
          return 1;
        }


        return Math.max(
          ...data.categories.map(
            (
              item
            ) =>
              item.potential_savings
          ),
          1
        );

      },
      [
        data,
      ]
    );


  return (
    <div className="cost-savings-page">


      {/* HEADER */}

      <section className="cost-savings-header">

        <div>

          <span className="dashboard-eyebrow">
            COST INTELLIGENCE
          </span>


          <h1>
            Cost Savings
          </h1>


          <p>
            Identify excess inventory,
            holding-cost exposure and the
            strongest opportunities for
            inventory capital optimization.
          </p>

        </div>

      </section>


      {error && (

        <div className="dashboard-data-error">
          {error}
        </div>

      )}


      {/* KPI GRID */}

      <section className="cost-kpi-grid">


        <article className="cost-kpi-card">

          <div className="cost-kpi-icon">

            <PiggyBank
              size={18}
            />

          </div>


          <span>
            POTENTIAL SAVINGS
          </span>


          <strong>

            {loading
              ? "..."
              : money(
                  summary
                    ?.potential_savings
                )}

          </strong>


          <p>
            Estimated annual opportunity
          </p>

        </article>


        <article className="cost-kpi-card">

          <div className="cost-kpi-icon">

            <CircleDollarSign
              size={18}
            />

          </div>


          <span>
            INVENTORY VALUE
          </span>


          <strong>

            {loading
              ? "..."
              : money(
                  summary
                    ?.total_inventory_value
                )}

          </strong>


          <p>
            Current tracked capital
          </p>

        </article>


        <article className="cost-kpi-card">

          <div className="cost-kpi-icon danger">

            <Boxes
              size={18}
            />

          </div>


          <span>
            EXCESS STOCK VALUE
          </span>


          <strong>

            {loading
              ? "..."
              : money(
                  summary
                    ?.total_excess_value
                )}

          </strong>


          <p>
            Capital tied in excess inventory
          </p>

        </article>


        <article className="cost-kpi-card">

          <div className="cost-kpi-icon">

            <Banknote
              size={18}
            />

          </div>


          <span>
            SAVINGS RATE
          </span>


          <strong>

            {loading
              ? "..."
              : percent(
                  summary
                    ?.savings_rate
                )}

          </strong>


          <p>
            Relative to annual holding cost
          </p>

        </article>

      </section>


      {/* SUMMARY GRID */}

      <section className="cost-summary-grid">


        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                CAPITAL EXPOSURE
              </span>


              <h3>
                Cost Breakdown
              </h3>

            </div>

          </div>


          <div className="cost-breakdown-list">


            <div>

              <span>
                Annual Holding Cost
              </span>


              <strong>
                {money(
                  summary
                    ?.annual_holding_cost
                )}
              </strong>

            </div>


            <div>

              <span>
                Excess Inventory Value
              </span>


              <strong>
                {money(
                  summary
                    ?.total_excess_value
                )}
              </strong>

            </div>


            <div>

              <span>
                Excess Stock Units
              </span>


              <strong>
                {number(
                  summary
                    ?.total_excess_stock
                )}
              </strong>

            </div>


            <div>

              <span>
                Items With Savings
              </span>


              <strong>
                {summary
                  ?.items_with_savings
                  .toLocaleString(
                    "en-IN"
                  ) ??
                  "—"}
              </strong>

            </div>


            <div>

              <span>
                Excess Value Ratio
              </span>


              <strong>
                {percent(
                  summary
                    ?.excess_value_rate
                )}
              </strong>

            </div>

          </div>

        </article>


        {/* CATEGORY SAVINGS */}

        <article className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span>
                SAVINGS DISTRIBUTION
              </span>


              <h3>
                Opportunity by Category
              </h3>

            </div>

          </div>


          <div className="cost-category-list">

            {data?.categories
              .slice(
                0,
                6
              )
              .map(
                (
                  category
                ) => (

                  <div
                    key={
                      category.category
                    }

                    className="cost-category-row"
                  >

                    <div className="cost-category-heading">

                      <span>
                        {
                          category.category
                        }
                      </span>


                      <strong>
                        {money(
                          category.potential_savings
                        )}
                      </strong>

                    </div>


                    <div className="cost-category-track">

                      <span
                        style={{
                          width:
                            `${
                              (
                                category.potential_savings /
                                maxCategorySavings
                              ) *
                              100
                            }%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

          </div>

        </article>

      </section>


      {/* TABLE */}

      <section className="dashboard-panel cost-table-panel">


        <div className="cost-table-header">

          <div>

            <span className="dashboard-eyebrow">
              SAVINGS OPPORTUNITIES
            </span>


            <h3>
              Inventory Cost Optimization
            </h3>

          </div>


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

        </div>


        <div className="cost-table-wrapper">

          <table className="cost-savings-table">

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
                  Recommended
                </th>

                <th>
                  Excess Units
                </th>

                <th>
                  Inventory Value
                </th>

                <th>
                  Excess Value
                </th>

                <th>
                  Annual Holding Cost
                </th>

                <th>
                  Potential Savings
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRecords.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={
                      10
                    }

                    className="cost-empty-row"
                  >
                    No matching savings opportunities.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record:
                      CostSavingsRecord
                  ) => (

                    <tr
                      key={
                        record.row_id
                      }
                    >

                      <td>
                        {
                          record.category
                        }
                      </td>


                      <td>
                        {
                          record.storage_location_id
                        }
                      </td>


                      <td>
                        {
                          record.zone
                        }
                      </td>


                      <td>
                        {number(
                          record.stock_level
                        )}
                      </td>


                      <td>
                        {number(
                          record.recommended_stock
                        )}
                      </td>


                      <td>
                        {number(
                          record.excess_stock
                        )}
                      </td>


                      <td>
                        {money(
                          record.inventory_value
                        )}
                      </td>


                      <td>
                        {money(
                          record.excess_stock_value
                        )}
                      </td>


                      <td>
                        {money(
                          record.annual_holding_cost
                        )}
                      </td>


                      <td className="cost-saving-highlight">

                        {money(
                          record.potential_savings
                        )}

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