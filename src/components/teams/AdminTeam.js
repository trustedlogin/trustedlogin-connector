import React, { useMemo, useEffect, useState, Fragment } from "react";
import TablePage, { ActionItemButton } from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
import { CenteredLayout, NarrowFormLayout } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { PrimaryButton } from "../Buttons";
import { __ } from "@wordpress/i18n";
import Modal from "../Modal";
import LoginOrLogout from "../LoginLogout";

const InviteMember = ({ team }) => {
  const handler = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    console.log({ email, team: team.account_id });
  };
  return (
    <NarrowFormLayout
      minimal={minimal}
      title={__("Invite New Team Member", "trustedlogin-vendor")}
      description={__("Lorem Ipsum", "trustedlogin-vendor")}>
      <>
        <form
          onSubmit={handler}
          aria-label={__("Invite New Team Member", "trustedlogin-vendor")}
          className="flex flex-col py-6 space-y-6 justify-center">
          <input name={"email"} type={"email"} placeholder={"Email Address"} />
          <PrimaryButton type={"submit"} onClick={handler}>
            {__("Invite", "trustedlogin-vendor")}
          </PrimaryButton>
        </form>
      </>
    </NarrowFormLayout>
  );
};

export default function AdminTeam() {
  const { currentTeam } = useView();
  //should show login form?
  const [showLogin, setShowLogin] = useState(false);
  //track state for modal open/close
  const [modalOpen, setModalTeam] = useState(false);
  const [members, setMembers] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
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

  const handleProxyResponse = (r) => {
    setHasLoaded(true);

    if (r.code) {
      switch (r.code) {
        case 401:
          setShowLogin(true);
          break;

        default:
          //nothing
          break;
      }
    }
    if (r.data) {
      return r.data;
    }
    return r;
  };

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
        let data = handleProxyResponse(r);
        if (data) {
          setMembers(data);
        }
      })
      .catch((e) => {
        handleProxyResponse(e);
        console.log({ e });
      });
  }, [currentTeam]);
  return (
    <>
      {!showLogin ? (
        <>
          {modalOpen ? (
            <Modal
              isOpen={true}
              Logo={() => <div> Logo?</div>}
              setIsOpen={setModalTeam}
              title={__("Invite New Team Member", "trustedlogin-vendor")}>
              <InviteMember team={currentTeam} />
            </Modal>
          ) : null}
          <section>
            {items.length <= 0 ? (
              <div>
                <CenteredLayout>
                  <>
                    <TitleDescriptionLink
                      title={hasLoaded ? "Loading" : __("No Team Data Found")}
                    />
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
                      <PrimaryButton onClick={() => setModalTeam(true)}>
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
        </>
      ) : (
        <>
          <LoginOrLogout />
        </>
      )}
    </>
  );
}
