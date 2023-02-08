import React, { useMemo, useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import TablePage, { ActionItemButton } from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
import { Fragment } from "@wordpress/element/build-types";
import { CenteredLayout } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
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
          subTitle: `Role: ${member.role}`,
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
      {items.length > 0 ? (
        <CenteredLayout>
          <>
            <TitleDescriptionLink title={__("No Data")} />
          </>
        </CenteredLayout>
      ) : (
        <TablePage
          title={"Admin Team"}
          subTitle={"Manage your team"}
          items={items}
          SearchArea={() => <></>}
          ActionArea={(item) => (
            <Fragment key={item.id}>
              <ActionItemButton></ActionItemButton>
            </Fragment>
          )}
        />
      )}
    </>
  );
}
