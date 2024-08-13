import { render } from "@testing-library/react";
import TrustedLoginSettings from "./TrustedLoginSettings";
import Provider, { testTeam } from "./TestProvider";
describe("TrustedLoginSettings", () => {
  it("renders & matches snapshot, with on-boarding completed", () => {
    const Wrapper = (props) => (
      <Provider {...props} hasOnboarded={true} initialTeams={[testTeam]} />
    );

    const { container } = render(<TrustedLoginSettings />, {
      wrapper: Wrapper,
    });
    expect(container).toMatchSnapshot();
  });

  it("renders & matches snapshot, with on-boarding NOT completed", () => {
    const Wrapper = (props) => <Provider {...props} hasOnboarded={false} />;
    const { container } = render(<TrustedLoginSettings />, {
      wrapper: Wrapper,
    });
    expect(container).toMatchSnapshot();
  });
});
