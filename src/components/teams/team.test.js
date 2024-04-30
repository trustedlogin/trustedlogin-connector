import AddTeam from "./AddTeam";
import { render, act, fireEvent } from "@testing-library/react";

import NoTeams from "./NoTeams";
import EditTeam, { HelpDeskSelect } from "./EditTeam";
import TeamsList from "./TeamsList";
import TestProvider, { testTeam } from "../TestProvider";
import teamFields from "./teamFields";
import { useRef } from "react";
import collectTeam from "./collectTeam";
const team = testTeam;

const Provider = (props) => (
  <TestProvider
    {...props}
    initialIntegrationSettings={{
      helpscout: {
        enabled: true,
      },
    }}
  />
);

describe("AddTeam", () => {
  it("Renders & Matches snapshot", () => {
    const { container } = render(<AddTeam />, { wrapper: Provider });
    expect(container).toMatchSnapshot();
  });
});

describe("NoTeams", () => {
  it("Renders & Matches snapshot", () => {
    const { container } = render(<NoTeams />, { wrapper: Provider });
    expect(container).toMatchSnapshot();
  });
});

describe("EditTeam", () => {
  it("Renders & Matches snapshot", () => {
    const { container } = render(<EditTeam team={team} />, {
      wrapper: Provider,
    });
    expect(container).toMatchSnapshot();
  });
  it("Changes values and collectTeams has those value", () => {
    const onClickSave = jest.fn();
    const Test = () => {
      return <EditTeam team={team} onClickSave={onClickSave} />;
    };
    const { getByLabelText, container } = render(<Test />, {
      wrapper: Provider,
    });
    act(() => {
      fireEvent.change(getByLabelText(teamFields.account_id.label), {
        target: { value: "12345" },
      });
      fireEvent.change(getByLabelText(teamFields.private_key.label), {
        target: { value: "secret" },
      });
      fireEvent.change(getByLabelText(teamFields.public_key.label), {
        target: { value: "public" },
      });
      return;
      fireEvent.change(getByLabelText(teamFields.approved_roles.label), {
        target: { value: "administrator" },
      });
    });
    act(() => {
      fireEvent.submit(container.getElementsByTagName("form")[0]);
    });
    expect(onClickSave).toBeCalledTimes(1);
    const lastCall = onClickSave.mock.calls[0][0];
    expect(lastCall[teamFields.account_id.id]).toEqual("12345");
    expect(lastCall[teamFields.public_key.id]).toEqual("public");
    expect(lastCall[teamFields.private_key.id]).toEqual("secret");
  });
});
describe("TeamsList", () => {
  it("Renders & Matches snapshot", () => {
    const Wrapper = (props) => <Provider {...props} initialTeams={[team]} />;
    const { container } = render(<TeamsList />, {
      wrapper: Wrapper,
    });
    expect(container).toMatchSnapshot();
  });
});
describe("HelpDeskSelect", () => {
  const options = [
    { label: "Help Scout", value: "helpscout" },
    { label: "FreeScout", value: "freescout" },
  ];
  it("Renders & Matches snapshot", () => {
    const Wrapper = (props) => <Provider {...props} />;
    const { container } = render(<HelpDeskSelect />, {
      wrapper: Wrapper,
    });
    expect(container).toMatchSnapshot();
  });

  it("Has options", () => {
    const { container } = render(<HelpDeskSelect options={options} />, {
      wrapper: Provider,
    });
    expect(container.querySelectorAll("option").length)
      //Add one for placeholder
      .toBe(options.length + 1);
  });
  it("Sets default, default value", () => {
    const { getByLabelText } = render(<HelpDeskSelect options={options} />, {
      wrapper: Provider,
    });
    expect(getByLabelText(teamFields.helpdesk.label).value).toBe(
      "Select a Help Desk"
    );
  });
  it("Sets default value", () => {
    const handleChange = jest.fn();

    const { getByLabelText } = render(
      <HelpDeskSelect
        value={"helpscout"}
        options={options}
        onChange={handleChange}
      />,
      {
        wrapper: Provider,
      }
    );
    expect(getByLabelText(teamFields.helpdesk.label).value).toBe("helpscout");
  });

  it("Changes value", () => {
    const { getByLabelText } = render(<HelpDeskSelect options={options} />, {
      wrapper: Provider,
    });
    act(() => {
      fireEvent.change(getByLabelText(teamFields.helpdesk.label), {
        target: { value: "helpscout" },
      });
    });
    expect(getByLabelText(teamFields.helpdesk.label).value).toBe("helpscout");
  });

  it("Changes value and collectTeams has that value", () => {
    const fn = jest.fn();
    const Test = () => {
      const formRef = useRef();
      const onSubmit = (e) => {
        e.preventDefault();
        const team = collectTeam(formRef.current);
        fn(team);
      };

      return (
        <form ref={formRef} onSubmit={onSubmit} data-testid="test">
          <HelpDeskSelect options={options} />
        </form>
      );
    };
    const { getByLabelText, getByTestId } = render(<Test />, {
      wrapper: Provider,
    });
    act(() => {
      fireEvent.change(getByLabelText(teamFields.helpdesk.label), {
        target: { value: "freescout" },
      });
    });
    act(() => {
      fireEvent.submit(getByTestId("test"));
    });
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith({
      [teamFields.helpdesk.id]: "freescout",
    });
  });
});
