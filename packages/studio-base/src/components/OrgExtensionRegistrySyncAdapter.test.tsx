/** @jest-environment jsdom */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { render, waitFor } from "@testing-library/react";
import fetchMock from "fetch-mock";

import { useConsoleApi } from "@foxglove/studio-base/context/ConsoleApiContext";
import { useCurrentUser } from "@foxglove/studio-base/context/CurrentUserContext";
import { useExtensionCatalog } from "@foxglove/studio-base/context/ExtensionCatalogContext";
import ExtensionCatalogProvider from "@foxglove/studio-base/providers/ExtensionCatalogProvider";
import { ExtensionLoader } from "@foxglove/studio-base/services/ExtensionLoader";
import { ExtensionInfo } from "@foxglove/studio-base/types/Extensions";

import { OrgExtensionRegistrySyncAdapter } from "./OrgExtensionRegistrySyncAdapter";

jest.mock("@foxglove/studio-base/context/CurrentUserContext");
jest.mock("@foxglove/studio-base/context/ConsoleApiContext");

function fakeExtension(overrides: Partial<ExtensionInfo>): ExtensionInfo {
  return {
    id: "id",
    description: "description",
    displayName: "display name",
    homepage: "homepage",
    keywords: ["keyword1", "keyword2"],
    license: "license",
    name: "name",
    namespace: "local",
    publisher: "publisher",
    qualifiedName: "qualified name",
    version: "1",
    ...overrides,
  };
}

const source = `
  module.exports = { activate: function() { return 1; } }
`;

function Wrapper(): JSX.Element {
  const registeredExtensions = useExtensionCatalog((state) => state.installedExtensions);
  return registeredExtensions ? <OrgExtensionRegistrySyncAdapter /> : <></>;
}

describe("Private registry sync adapter", () => {
  it("Syncs private extensions", async () => {
    const getExtensions = jest.fn();
    const getExtension = jest.fn();

    (useCurrentUser as jest.Mock).mockReturnValue({ currentUser: true });
    (useConsoleApi as jest.Mock).mockReturnValue({
      getExtensions,
      getExtension,
    });

    getExtensions.mockReturnValue([
      { name: "id1" },
      { name: "id2" },
      { name: "private-installed-1", activeVersion: "2" },
      { name: "private-installed-2", activeVersion: "1" },
    ]);
    getExtension.mockReturnValue({ foxe: "url" });

    fetchMock.get("url", new Uint8Array());

    const mockPrivateLoader = {
      namespace: "org",
      getExtensions: jest
        .fn()
        .mockResolvedValue([
          fakeExtension({ namespace: "org", name: "private-installed-1", version: "1" }),
          fakeExtension({ namespace: "org", name: "private-installed-2", version: "1" }),
          fakeExtension({ namespace: "org", name: "private-to-delete", version: "1" }),
        ]),
      loadExtension: jest.fn().mockResolvedValue(source),
      installExtension: jest.fn(),
      uninstallExtension: jest.fn(),
    };

    render(
      <ExtensionCatalogProvider loaders={[mockPrivateLoader as ExtensionLoader]}>
        <Wrapper />
      </ExtensionCatalogProvider>,
    );

    await waitFor(() => expect(mockPrivateLoader.installExtension).toHaveBeenCalledTimes(3));
    expect(mockPrivateLoader.uninstallExtension).toHaveBeenCalledTimes(1);
  });
});
