import { render } from "@testing-library/react";
import { IntegrationComponent } from "./Integration";
import {ConfigureHelpDesk} from "./ConfigureIntegration";
import Provider from "../TestProvider";
describe("IntegrationComponent", () => {
  it("renders and matches snapshot", () => {
    const { container } = render(<IntegrationComponent helpdesk={'helpscout'} />, {
      wrapper: Provider,
    });
    expect(container).toMatchSnapshot();
  });
});
describe("ConfigureHelpDesk", () => {
  beforeAll(() => {
    //@see https://stackoverflow.com/a/57270851/1469799
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}

      disconnect() {
        return null;
      }

      observe() {
        return null;
      }

      takeRecords() {
        return null;
      }

      unobserve() {
        return null;
      }
    };
  });
  it("renders and matches snapshot while closed", () => {
    const { container } = render(
      <ConfigureHelpDesk isOpen={false} setIsOpen={jest.fn()} helpDesk={'helpscout'} />,
      {
        wrapper: Provider,
      }
    );
    expect(container).toMatchSnapshot();
  });

  it("renders and matches snapshot while open", () => {
    const { container } = render(
      <ConfigureHelpDesk isOpen={true} setIsOpen={jest.fn()} helpDesk={'helpscout'} />,
      {
        wrapper: Provider,
      }
    );
    expect(container).toMatchSnapshot();
  });
});
