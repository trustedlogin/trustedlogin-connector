import React, { useMemo, useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import TablePage from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
export default function AdminTeam() {
  const { currentTeam } = useView();

  const [members, setMembers] = useState([]);
  const items = useMemo(() => {
    if (members.length > 0) {
      return members.map((member) => {
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
        };
      });
    }
    return [];
  }, [members]);

  useEffect(() => {
    if (currentTeam < 1) return;
    fetchWithProxyRoute({
      proxyRoute: "api.teams.members",
      method: "GET",
      data: {
        team: currentTeam,
      },
      type: "teams",
    })
      .then((r) => {
        console.log({ r });
        setMembers(r.data);
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
