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
import { InputField, SelectField } from "./fields";
import { useSettings } from "../../hooks/useSettings";

//Invite a new member to the team
const InviteMember = ({ teamId, onInvited }) => {
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const handler = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const email = formRef.current.email.value;
    const name = formRef.current.name.value;
    const data = {
      team: teamId,
      email,
      name,
    };
    fetchWithProxyRoute({
      proxyRoute: "api.teams.invite",
      method: "POST",
      data,
      type: "teams",
    })
      .then((response) => {
        console.log({ response });

        if (201 == response.code) {
          onInvited();
        }
      })
      .catch((e) => {
        if (e.data && e.data.message) {
          setErrorMessage(e.data.message);
        } else {
          setErrorMessage("Error inviting member.");
        }
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
          {errorMessage ? (
            <p className="bg-red-700 p-4 text-white">{errorMessage}</p>
          ) : null}
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
//change role on team
const ChangeRole = ({ teamId, member, onRoleChanged }) => {
  const formRef = useRef(null);
  const handler = (e) => {
    e.preventDefault();
    const role = formRef.current.role.value;
    const data = {
      team: teamId,
      user: member,
      role,
    };
    onRoleChanged(data);
  };
  return (
    <form
      ref={formRef}
      onSubmit={handler}
      aria-label={__("Change Role", "trustedlogin-vendor")}
      className="flex flex-col py-6 space-y-6 justify-center">
      <SelectField
        name={"role"}
        id={"role"}
        label={__("Role", "trustedlogin-vendor")}
        required={true}>
        <option value={"admin"}>{__("Admin", "trustedlogin-vendor")}</option>
        <option value={"editor"}>{__("Editor", "trustedlogin-vendor")}</option>
      </SelectField>
      <PrimaryButton type={"submit"} onClick={handler}>
        {__("Change Role", "trustedlogin-vendor")}
      </PrimaryButton>
    </form>
  );
};

/**
 * Admin interface for a team
 */
export default function AdminTeam({ teamId }) {
  const { setNotice } = useSettings();
  //should show login form?
  const [showLogin, setShowLogin] = useState(false);
  //track state for modal mode
  // false|invite|remove
  const [modalMode, setModalMode] = useState(false);
  const [members, setMembers] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  //needs to refresh members
  const [needsRefresh, setNeedsRefresh] = useState(false);
  //member to remove/edit/etc.
  const [memberToEdit, setMemberToEdit] = useState(null);

  //remove member
  const onRemoveMember = () => {
    if (!memberToEdit) {
      alert("No memberToEdit to remove.");
      return;
    }
    fetchWithProxyRoute({
      proxyRoute: "api.teams.removeTeamMember",
      method: "DELETE",
      data: {
        team: teamId,
        user: user,
      },
      type: "teams",
    })
      .then((r) => {
        handleProxyResponse(r);
        setNeedsRefresh(true);
        setNotice({
          message: __("Member removed.", "trustedlogin-vendor"),
          type: "text",
          visible: true,
        });
        setModalMode(false);
      })
      .catch((e) => {
        handleProxyResponse(e);
        console.log({ e });
      });
  };

  //When invited, close modal
  const onInvited = () => {
    setModalMode(false);
    //reload members
    setNeedsRefresh(true);
    setNotice({
      message: __("Member invited.", "trustedlogin-vendor"),
      type: "text",
      visible: true,
    });
  };

  //When role change ready,
  const onRoleChanged = (data) => {
    fetchWithProxyRoute({
      proxyRoute: "api.teams.changeRole",
      method: "POST",
      data,
      type: "teams",
    }).then((r) => {
      if (201 === r.code) {
        setNeedsRefresh(true);
        setNotice({
          message: __("Role changed.", "trustedlogin-vendor"),
          type: "text",
          visible: true,
        });
        setModalMode(false);
      } else {
        console.log({ r });
        setModalMode(false);
        setNotice({
          message: __("Role change failed", "trustedlogin-vendor"),
          type: "error",
          visible: true,
        });
      }
    });
  };

  /**
   * Modal for editing/removing/etc.
   */
  const EditModal = useMemo(() => {
    if (!modalMode) return null;
    let title = "";
    let Inside = null;
    switch (modalMode) {
      case "invite":
        title = __("Invite New Team Member", "trustedlogin-vendor");
        Inside = <InviteMember teamId={teamId} onInvited={onInvited} />;
        break;
      case "remove":
        title = __("Confirm", "trustedlogin-vendor");
        Inside = (
          <PrimaryButton onClick={onRemoveMember}>
            {__("Remove", "trustedlogin-vendor")}
          </PrimaryButton>
        );
        break;
      case "change-role":
        title = __("Change Role", "trustedlogin-vendor");
        Inside = (
          <ChangeRole
            teamId={teamId}
            member={memberToEdit}
            onRoleChanged={onRoleChanged}
          />
        );
      default:
        break;
    }
    return (
      <Modal
        showButtonsAtBottom={false}
        isOpen={true}
        setIsOpen={() => {
          setModalMode(false);
        }}
        title={title}>
        <Inside />
      </Modal>
    );
  }, [memberToEdit, modalMode]);
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
        setNeedsRefresh(false);
      })
      .catch((e) => {
        handleProxyResponse(e);
        console.log({ e });
        setNeedsRefresh(false);
      });
  }, [teamId, needsRefresh]);
  return (
    <>
      {!showLogin ? (
        <>
          {modalMode ? (
            <Fragment>
              <EditModal />
            </Fragment>
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
                          setModalMode("invite");
                        }}>
                        {__("Invite Team Member", "trustedlogin-vendor")}
                      </PrimaryButton>
                    </Fragment>
                  )}
                  ActionArea={(item) => (
                    <Fragment key={item.id}>
                      <ActionItemButton isRed={false}>Button</ActionItemButton>
                      {item.role != "owner" ? (
                        <>
                          <ActionItemButton
                            isRed={true}
                            onClick={() => {
                              setMemberToEdit(item.id);
                              setModalMode("remove");
                            }}>
                            {__("Remove", "trustedlogin-vendor")}
                          </ActionItemButton>
                          <ActionItemButton
                            isRed={true}
                            onClick={() => setModalMode("change-role")}>
                            {__("Change Role", "trustedlogin-vendor")}
                          </ActionItemButton>
                        </>
                      ) : null}
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
