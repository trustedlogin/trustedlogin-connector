import React, { useMemo, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import TablePage from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
export default function AdminTeam() {
  const { currentTeam } = useView();
  const items = useMemo(() => {
    return [];
  });

  useEffect(() => {
    fetchWithProxyRoute({
      proxyRoute: "api.teams.get",
      method: "GET",
      data: {
        team: currentTeam,
      },
      type: "users",
    })
      .then((r) => {
        console.log({ r });
      })
      .catch((e) => {
        console.log({ e });
      });
  }, [currentTeam]);
  return (
    <>
      {items.length === 0 && <div>No Data</div>}
      <TablePage
        title={"Admin Team"}
        subTitle={"Manage your team"}
        items={items}
        SearchArea={() => <></>}
        ActionArea={(item) => <div className="flex flex-row">Actions</div>}
      />
    </>
  );
}
