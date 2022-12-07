import { render } from "@testing-library/react";
import React from "react";
import Connector from "./index";
//Test Connector renders in both states
describe("Connector", () => {
  it("Renders unconnected", () => {
    const { getByText } = render(<Connector connected={false} />);
    expect(getByText("Login")).toBeTruthy();
  });
  it("Renders connected", () => {
    const { getByText } = render(<Connector connected={true} />);
    expect(getByText("Possible Accounts")).toBeTruthy();
  });
});
