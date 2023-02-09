import React, { useMemo, useEffect, useState, Fragment } from "react";
import TablePage, { ActionItemButton } from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
import { CenteredLayout } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { PrimaryButton } from "../Buttons";
import { __ } from "@wordpress/i18n";
export default function AdminTeam() {
  const { currentTeam } = useView();
  //track state for modal open/close
  const [modalOpen, setModalOpen] = useState(false);
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
    <section>
      {items.length <= 0 ? (
        <div>
          <CenteredLayout>
            <>
              <TitleDescriptionLink title={__("No Data")} />
            </>
          </CenteredLayout>
        </div>
      ) : (
        <div>
          <TablePage
            title={"Admin Team"}
            subTitle={"Manage your team"}
            items={items}
            SearchArea={() => (
              <Fragment>
                <PrimaryButton onClick={() => setModalOpen(true)}>
                  {__("Invite Team Member")}
                </PrimaryButton>
              </Fragment>
            )}
            ActionArea={(item) => (
              <Fragment key={item.id}>
                <ActionItemButton isRed={false}>Button</ActionItemButton>
              </Fragment>
            )}
          />
        </div>
      )}
    </section>
  );
}
