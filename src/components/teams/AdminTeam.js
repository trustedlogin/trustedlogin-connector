import React, { useMemo, useEffect, useRef, useState, Fragment } from "react";
import TablePage, { ActionItemButton } from "../TablePage";
import { useView } from "../../hooks/useView";
import { fetchWithProxyRoute } from "../../api";
import { CenteredLayout, NarrowFormLayout } from "../Layout";
import TitleDescriptionLink from "../TitleDescriptionLink";
import { PrimaryButton } from "../Buttons";
import { __ } from "@wordpress/i18n";
import Modal from "../Modal";
import LoginOrLogout from "../LoginLogout";
import { InputField } from "./fields";

const InviteMember = ({ teamId }) => {
  const formRef = useRef(null);
  const handler = (e) => {
    e.preventDefault();

    const email = formRef.current.email.value;
    const name = formRef.current.name.value;
    const data = {
      team: teamId,
      email,
      name,
    };
    console.log({ data });
    fetchWithProxyRoute({
      proxyRoute: "api.teams.invite",
      method: "POST",
      data,
      type: "teams",
    })
      .then((response) => {
        console.log({ response });
      })
      .catch((e) => {
        console.log({ e });
      });
  };
  return (
    <>
      <>
        <form
          ref={formRef}
          onSubmit={handler}
          aria-label={__("Invite New Team Member", "trustedlogin-vendor")}
          className="flex flex-col py-6 space-y-6 justify-center">
          <InputField
            name={"email"}
            type={"email"}
            id={"email"}
            label={__("Email Address", "trustedlogin-vendor")}
            required={true}
          />
          <InputField
            name={"name"}
            type={"text"}
            id={"name"}
            label={__("Name", "trustedlogin-vendor")}
            required={true}
          />
          <PrimaryButton type={"submit"} onClick={handler}>
            {__("Invite", "trustedlogin-vendor")}
          </PrimaryButton>
        </form>
      </>
    </>
  );
};

export default function AdminTeam({ teamId }) {
  console.log({ teamId });
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
    //return early if teamId is undefined
    if (!teamId) {
      return;
    }

    fetchWithProxyRoute({
      proxyRoute: "api.teams.members",
      method: "GET",
      data: {
        team: teamId,
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
  }, [teamId]);
  return (
    <>
      {!showLogin ? (
        <>
          {modalOpen ? (
            <Modal
              showButtonsAtBottom={false}
              isOpen={true}
              setIsOpen={() => {
                setModalTeam(false);
              }}
              title={__("Invite New Team Member", "trustedlogin-vendor")}>
              <InviteMember teamId={teamId} />
            </Modal>
          ) : null}
          <section>
            {items.length <= 0 ? (
              <div>
                <CenteredLayout>
                  <>
                    <TitleDescriptionLink
                      title={
                        !hasLoaded
                          ? __("Loading", "trustedlogin-vendor")
                          : __("No Team Data Found")
                      }
                    />
                  </>
                </CenteredLayout>
              </div>
            ) : (
              <div>
                <TablePage
                  title={__("Admin Team", "trustedlogin-vendor")}
                  subTitle={__("Manage your team", "trustedlogin-vendor")}
                  items={items}
                  SearchArea={() => (
                    <Fragment>
                      <PrimaryButton
                        onClick={() => {
                          setModalTeam(true);
                          setCurrentTeam(currentTeam);
                        }}>
                        {__("Invite Team Member", "trustedlogin-vendor")}
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
