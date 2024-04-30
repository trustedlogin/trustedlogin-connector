import { render, act, fireEvent } from "@testing-library/react";
import { ScreenError, PageError, ToastError } from "./Errors";
describe("ScreenError", () => {
  it("renders with only heading", () => {
    const { container } = render(<ScreenError heading={"An Error"} />);
    expect(container).toMatchSnapshot();
  });
  it("renders with text & heading", () => {
    const { container, getByText } = render(
      <ScreenError heading={"Heading Text"} text={"Text text"} />
    );
    //Run this to make sure the error text is rendered
    getByText("Heading Text");
    getByText("Text text");
    expect(container).toMatchSnapshot();
  });
  it("is retryable", () => {
    const { container, getByText } = render(
      <ScreenError
        isDismissible={true}
        heading={"An Error"}
        text={"Some text"}
      />
    );
    expect(container.querySelectorAll(".tl-error").length).toBe(1);
    act(() => {
      fireEvent.click(getByText("Dismiss"));
    });

    expect(container.querySelectorAll(".tl-error").length).toBe(0);
  });
  it("Is retryable", () => {
    const retryClick = jest.fn();
    const { getByText } = render(<ScreenError retryClick={retryClick} />);
    act(() => {
      fireEvent.click(getByText("Try again"));
    });
    expect(retryClick).toHaveBeenCalledTimes(1);
  });
  it("Has learn more link", () => {
    const learnMoreLink = "https://example.com/";
    const { getByText } = render(<ScreenError learnMoreLink={learnMoreLink} />);

    expect(getByText("Learn more").href).toEqual(learnMoreLink);
  });
  it("Has learn more link && is retryable", () => {
    const learnMoreLink = "https://example.com/";
    const retryClick = jest.fn();
    const { getByText } = render(
      <ScreenError learnMoreLink={learnMoreLink} retryClick={retryClick} />
    );
    expect(getByText("Learn more").href).toEqual(learnMoreLink);
    act(() => {
      fireEvent.click(getByText("Try again"));
    });
    expect(retryClick).toHaveBeenCalledTimes(1);
  });
});
describe("PageError", () => {
  it("renders", () => {
    const onClick = jest.fn();
    const { container } = render(<PageError onClick={onClick} />);
    expect(container).toMatchSnapshot();
  });
  it("Is clickable", () => {
    const onClick = jest.fn();
    const { getByText } = render(<PageError onClick={onClick} />);
    act(() => {
      fireEvent.click(getByText("Try again"));
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
describe("ToastError", () => {
  it("renders with only heading", () => {
    const { container } = render(<ToastError heading={"An Error"} />);
    expect(container).toMatchSnapshot();
  });
  it("renders with text & heading", () => {
    const { container } = render(
      <ToastError heading={"An Error"} text={"Some text"} />
    );
    expect(container).toMatchSnapshot();
  });
  it("is retryable", () => {
    const { container, getByText } = render(
      <ToastError
        isDismissible={true}
        heading={"An Error"}
        text={"Some text"}
      />
    );
    expect(container.querySelectorAll(".tl-error").length).toBe(1);
    act(() => {
      fireEvent.click(getByText("Close"));
    });

    expect(container.querySelectorAll(".tl-error").length).toBe(0);
  });
  it("Is retryable", () => {
    const retryClick = jest.fn();
    const { getByText } = render(<ToastError retryClick={retryClick} />);
    act(() => {
      fireEvent.click(getByText("Try again"));
    });
    expect(retryClick).toHaveBeenCalledTimes(1);
  });
  it("Has learn more link", () => {
    const learnMoreLink = "https://example.com/";
    const { getByText } = render(<ToastError learnMoreLink={learnMoreLink} />);

    expect(getByText("Learn more").href).toEqual(learnMoreLink);
  });
  it("Has learn more link && is retryable", () => {
    const learnMoreLink = "https://example.com/";
    const retryClick = jest.fn();
    const { getByText } = render(
      <ToastError learnMoreLink={learnMoreLink} retryClick={retryClick} />
    );
    expect(getByText("Learn more").href).toEqual(learnMoreLink);
    act(() => {
      fireEvent.click(getByText("Try again"));
    });
    expect(retryClick).toHaveBeenCalledTimes(1);
  });
});
