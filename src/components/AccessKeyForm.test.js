import AccessKeyForm from "./AccessKeyForm";
import { render } from "@testing-library/react";
import TestProvider, { testTeam } from "./TestProvider";
const team = testTeam;

const Provider = (props) => <TestProvider hasOnboarded={true} {...props} />;
describe("Access Key Login Form", () => {
  beforeEach(() => {
    window.tlVendor = {
      accessKey: {
        action: "trustedlogin",
        provider: "test",
        _tl_ak_nonce: "nonce",
      },
      redirectData: {
        "7aa999a0091e000c6d075590f8eb400e2": {
          siteurl: "https://dev.local",
          loginurl:
            "https://dev.local/c3111dde7ae5c60d964ae8f884a71a38/86352ccd83498ffcf0aba1058b1750b6da761be46c82f523af088f0bbb6c7badaabb8777e9b384333d7f261ca78ca77e3088ffd318a51b8dec9ffe0ab6608f8e",
          endpoint: "c3011111111111111111111111111118",
          identifier:
            "81111ccd83498ffcf0aba1058b1750b6da761be46c82f523af088f0bbb6c7badaabb8777e9b384333d7f261ca78ca77e3088ffd318a51b8dec9ffe0ab6608f8e",
        },
        "0eeeed63c8d222ed63f44a88799e2c2c9": {
          siteurl: "https://tepila.test.trustedlogin.dev",
          loginurl:
            "https://tepila.test.trustedlogin.dev/9411111eee2978c964c1e81fec5897d8/b95c36d5694487fcb939342af63485ae25fc936dfa6e15340fcf8f7d6520d32e8ac0f4b9812633f5e07f4edc2bde510a796c3027b7e9bcfb3c76038e8b672ed1",
          endpoint: "94011111111111111111111111111118",
          identifier:
            "b11ccccd5694487fcb939342af63485ae25fc936dfa6eeeee0fcf8f7d6520d32e8ac0f4b9812633f5e07f4edc2bde510a796c3027b7e9bcfb3c76038e8b672ed1",
        },
      },
    };
  });
  it("renders and matches snapshot", () => {
    const { container } = render(
      <AccessKeyForm initialAccountId={team.account_id} />,
      { wrapper: Provider }
    );
    expect(container).toMatchSnapshot();
  });
});
