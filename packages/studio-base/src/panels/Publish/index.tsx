// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

/* eslint-disable no-restricted-syntax */
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2019-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button, Typography, styled as muiStyled, OutlinedInput } from "@mui/material";
import { IconButton, TextFieldProps, TextField, styled as muiStyled } from "@mui/material";
import produce from "immer";
import { set } from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useRethrow } from "@foxglove/hooks";
import { SettingsTreeAction, SettingsTreeNodes } from "@foxglove/studio";
import { useDataSourceInfo } from "@foxglove/studio-base/PanelAPI";
import Autocomplete, { IAutocomplete } from "@foxglove/studio-base/components/Autocomplete";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import { NumberInput } from "@foxglove/studio-base/components/SettingsTreeEditor/inputs";
import Stack from "@foxglove/studio-base/components/Stack";
import usePublisher from "@foxglove/studio-base/hooks/usePublisher";
import TeleopPanel from "@foxglove/studio-base/panels/Teleop/TeleopPanel";
import { PlayerCapabilities, Topic } from "@foxglove/studio-base/players/types";
import { usePanelSettingsTreeUpdate } from "@foxglove/studio-base/providers/PanelSettingsEditorContextProvider";
import { SaveConfig } from "@foxglove/studio-base/types/panels";
import { fonts } from "@foxglove/studio-base/util/sharedStyleConstants";

// my added imports

//import croprows from './crop_rows.png';
import buildSampleMessage from "./buildSampleMessage";
import croprowalt from "./crop_row_image_reflected.png";

//

import helpContent from "./index.help.md";
import PuzzleCube24Regular from "@fluentui/react-icons/lib/esm/components/PuzzleCube24Regular";

type Config = Partial<{
  topicName: string;
  datatype: string;
  buttonText: string;
  buttonTooltip: string;
  buttonColor: string;
  advancedView: boolean;
  value: string;
}>;

type Props = {
  config: Config;
  saveConfig: SaveConfig<Config>;
};

export var inManual = false;

function buildSettingsTree(config: Config): SettingsTreeNodes {
  return {
    general: {
      icon: "Settings",
      fields: {
        advancedView: { label: "Editing Mode", input: "boolean", value: config.advancedView },
        buttonText: { label: "Button Title", input: "string", value: config.buttonText },
        buttonTooltip: { label: "Button Tooltip", input: "string", value: config.buttonTooltip },
        buttonColor: { label: "Button Color", input: "rgb", value: config.buttonColor },
      },
    },
  };
}

const StyledButton = muiStyled(Button, {
  shouldForwardProp: (prop) => prop !== "buttonColor",
})<{ buttonColor?: string }>(({ theme, buttonColor }) => {
  if (buttonColor == undefined) {
    return {};
  }
  const augmentedButtonColor = theme.palette.augmentColor({
    color: { main: buttonColor },
  });

  return {
    backgroundColor: augmentedButtonColor.main,
    color: augmentedButtonColor.contrastText,

    "&:hover": {
      backgroundColor: augmentedButtonColor.dark,
    },
  };
});

const StyledTextarea = muiStyled(OutlinedInput)(({ theme }) => ({
  width: "100%",
  height: "100%",
  textAlign: "left",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  padding: theme.spacing(1, 0.5),

  ".MuiInputBase-input": {
    height: "100% !important",
    font: "inherit",
    lineHeight: 1.4,
    fontFamily: fonts.MONOSPACE,
    fontSize: "100%",
    overflow: "auto !important",
    resize: "none",
  },
}));

const top11 = {
  command: 1,
  row: "row 11",
};

const top12 = {
  command: 1,
  row: "row 12",
};

const top13 = {
  command: 1,
  row: "row 13",
};

const top14 = {
  command: 1,
  row: "row 14",
};

const top15 = {
  command: 1,
  row: "row 15",
};

const top21 = {
  command: 1,
  row: "row 21",
};

const top22 = {
  command: 1,
  row: "row 22",
};

const top23 = {
  command: 1,
  row: "row 23",
};

const top24 = {
  command: 1,
  row: "row 24",
};

const top25 = {
  command: 1,
  row: "row 25",
};

function getTopicName(topic: Topic): string {
  return topic.name;
}

function parseInput(value: string): { error?: string; parsedObject?: unknown } {
  let parsedObject;
  let error = undefined;
  try {
    const parsedAny: unknown = JSON.parse(value);
    if (Array.isArray(parsedAny)) {
      error = "Message content must be an object, not an array";
    } else if (parsedAny == null) {
      error = "Message content must be an object, not null";
    } else if (typeof parsedAny !== "object") {
      error = `Message content must be an object, not ‘${typeof parsedAny}’`;
    } else {
      parsedObject = parsedAny;
    }
  } catch (e) {
    error = value.length !== 0 ? e.message : "";
  }
  return { error, parsedObject };
}

function changeMode() {
  inManual = !inManual;
  console.log(inManual);
}

/*
const divStyle  {
  backgroundImage: 'url(' {croprows} ')'
}
*/

function Publish(props: Props) {
  const { topics, datatypes, capabilities } = useDataSourceInfo();
  const {
    config: {
      topicName = "",
      datatype = "",
      buttonText = "Publish",
      buttonTooltip = "",
      buttonColor = "#00A871",
      advancedView = true,
      value = "",
    },
    saveConfig,
  } = props;

  const mydatatype = "row_info/Croprow";
  const mydatatypes = "";
  const mytopicName = "/crop_rows";

  const publish = usePublisher({ name: "Publish", topic: topicName, datatype, datatypes });

  const datatypeNames = useMemo(() => Array.from(datatypes.keys()).sort(), [datatypes]);
  const { error, parsedObject } = useMemo(() => parseInput(value), [value]);
  const updatePanelSettingsTree = usePanelSettingsTreeUpdate();

  // when the selected datatype changes, replace the textarea contents with a sample message of the correct shape
  // Make sure not to build a sample message on first load, though -- we don't want to overwrite
  // the user's message just because prevDatatype hasn't been initialized.
  const prevDatatype = useRef<string | undefined>();
  useEffect(() => {
    if (
      datatype.length > 0 &&
      prevDatatype.current != undefined &&
      datatype !== prevDatatype.current &&
      datatypes.get(datatype) != undefined
    ) {
      const sampleMessage = buildSampleMessage(datatypes, datatype);
      if (sampleMessage != undefined) {
        const stringifiedSampleMessage = JSON.stringify(sampleMessage, undefined, 2);
        saveConfig({ value: stringifiedSampleMessage });
      }
    }
    prevDatatype.current = datatype;
  }, [saveConfig, datatype, datatypes]);

  const actionHandler = useCallback(
    (action: SettingsTreeAction) => {
      if (action.action !== "update") {
        return;
      }

      saveConfig(
        produce((draft) => {
          set(draft, action.payload.path.slice(1), action.payload.value);
        }),
      );
    },
    [saveConfig],
  );

  useEffect(() => {
    updatePanelSettingsTree({
      actionHandler,
      nodes: buildSettingsTree(props.config),
    });
  }, [actionHandler, props.config, updatePanelSettingsTree]);

  const onChangeTopic = useCallback(
    (_event: unknown, name: string) => {
      saveConfig({ topicName: name });
    },
    [saveConfig],
  );

  // when a known topic is selected, also fill in its datatype
  const onSelectTopic = useCallback(
    (name: string, topic: Topic, autocomplete: IAutocomplete) => {
      saveConfig({ topicName: name, datatype: topic.datatype });
      autocomplete.blur();
    },
    [saveConfig],
  );

  const onSelectDatatype = useCallback(
    (newDatatype: string, _value: unknown, autocomplete: IAutocomplete) => {
      saveConfig({ datatype: newDatatype });
      autocomplete.blur();
    },
    [saveConfig],
  );

  const onPublishClicked = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && parsedObject != undefined) {
        publish(parsedObject as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
      console.log("datatype");
      console.log(datatype);
      console.log("datatypes");
      console.log(datatypes);
    }, [publish, parsedObject, topicName]),
  );

  const onOperationModeClicked = useRethrow(
    useCallback(() => {
      changeMode();
    }, [changeMode]),
  );

  const rowTestPublish = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && parsedObject != undefined) {
        publish(parsedObject as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, parsedObject, topicName]),
  );

  // I am aware that this is an absolutely horrendous way to do this but I can't figure out how to get functions accept parameters lol
  const pub11 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top11 != undefined) {
        publish(top11 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top11, topicName]),
  );

  const pub12 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top12 != undefined) {
        publish(top12 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top12, topicName]),
  );

  const pub13 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top13 != undefined) {
        publish(top13 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top13, topicName]),
  );

  const pub14 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top14 != undefined) {
        publish(top14 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top14, topicName]),
  );

  const pub15 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top15 != undefined) {
        publish(top15 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top15, topicName]),
  );

  const pub21 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top21 != undefined) {
        publish(top21 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top21, topicName]),
  );

  const pub22 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top22 != undefined) {
        publish(top22 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top22, topicName]),
  );

  const pub23 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top23 != undefined) {
        publish(top23 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top23, topicName]),
  );

  const pub24 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top24 != undefined) {
        publish(top24 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top24, topicName]),
  );

  const pub25 = useRethrow(
    useCallback(() => {
      if (topicName.length !== 0 && top25 != undefined) {
        publish(top25 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }
    }, [publish, top25, topicName]),
  );


  const canPublish = capabilities.includes(PlayerCapabilities.advertise);

  return (
    /*
    <div
      id="container"
      style={{
        backgroundImage: `url(${croprowalt})`,
        height: "700px",
        width: "1500px",
      }}
    >
      <div>
        <Button onClick={onPublishClicked}></Button>
        <StyledButton
          // Operation Mode //
          variant="contained"
          size="large"
          //buttonText = "other test 0"
          buttonColor={buttonColor ? buttonColor : undefined}
          title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
          onClick={testDefaultTopic}
        ></StyledButton>
        <Button></Button>
      </div>
      <div>
        <Button></Button>
        <Button></Button>
      </div>
      <div>
        <Button></Button>
        <Button></Button>
      </div>
    </div> */


    <Stack fullHeight style={{
      backgroundImage: `url(${croprowalt})`,
    }}>
      <PanelToolbar helpContent={helpContent} />
      {advancedView && (
        <Stack flex="auto" padding={10} gap={2} paddingBottom={0}>
          <div style={{ backgroundImage: "url(" + "C:/Users/mrdav/Desktop" + ")" }}>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <Typography color="text.secondary" variant="body2" component="label">
                Topic:
              </Typography>
              <Autocomplete
                placeholder="Choose a topic"
                items={[...topics]}
                hasError={false}
                onChange={onChangeTopic}
                onSelect={onSelectTopic}
                selectedItem={{ name: topicName, datatype: "" }}
                getItemText={getTopicName}
                getItemValue={getTopicName}
              />
            </Stack>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <Typography color="text.secondary" variant="body2" component="label">
                Datatype:
              </Typography>
              <Autocomplete
                clearOnFocus
                placeholder="Choose a datatype"
                items={datatypeNames}
                onSelect={onSelectDatatype}
                selectedItem={datatype}
              />
            </Stack>
          </div>

          <Stack direction="row" alignItems="center" padding={10}>
            <Stack direction="column" gap = {5} padding = {10}>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={"test"}
              onClick={pub11}
            ></StyledButton>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub21}
            ></StyledButton>
            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub12}
            ></StyledButton>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub22}
            ></StyledButton>
            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub13}
            ></StyledButton>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub23}
            ></StyledButton>
            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub14}
            ></StyledButton>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub24}
            ></StyledButton>
            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub15}
            ></StyledButton>
              <StyledButton
              variant="contained"
              size="large"
              buttonColor={buttonColor ? buttonColor : undefined}
              title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
              onClick={pub25}
            ></StyledButton>
            </Stack>

          </Stack>

        </Stack>
      )}
    </Stack>

    // </div>
    /*
    <Stack fullHeight>
      <PanelToolbar helpContent={helpContent} />
      {advancedView && (
        <Stack flex="auto" padding={10} gap={2} paddingBottom={0}>
          <div style={{ backgroundImage: "url(" + "C:/Users/mrdav/Desktop" + ")" }}>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <Typography color="text.secondary" variant="body2" component="label">
                Topic:
              </Typography>
              <Autocomplete
                placeholder="Choose a topic"
                items={[...topics]}
                hasError={false}
                onChange={onChangeTopic}
                onSelect={onSelectTopic}
                selectedItem={{ name: topicName, datatype: "" }}
                getItemText={getTopicName}
                getItemValue={getTopicName}
              />
            </Stack>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <Typography color="text.secondary" variant="body2" component="label">
                Datatype:
              </Typography>
              <Autocomplete
                clearOnFocus
                placeholder="Choose a datatype"
                items={datatypeNames}
                onSelect={onSelectDatatype}
                selectedItem={datatype}
              />
            </Stack>
          </div>

          <StyledButton
            // Operation Mode //
            variant="contained"
            size="large"
            //buttonText = "other test 0"
            buttonColor={buttonColor ? buttonColor : undefined}
            title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
            //disabled={!canPublish || parsedObject == undefined}
            onClick={onOperationModeClicked}
          ></StyledButton>
          <StyledButton
            //buttonText = "other test 1"

            variant="contained"
            size="large"
            buttonColor={buttonColor ? buttonColor : undefined}
            title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
            disabled={!canPublish || parsedObject == undefined}
            onClick={onPublishClicked}
          ></StyledButton>
          <StyledButton
            //buttonText = "other test 2"
            variant="contained"
            size="large"
            buttonColor={buttonColor ? buttonColor : undefined}
            title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
            disabled={!canPublish || parsedObject == undefined}
            onClick={onPublishClicked}
          ></StyledButton>
          <StyledButton
            //buttonText = "other test 3"
            variant="contained"
            size="large"
            buttonColor={buttonColor ? buttonColor : undefined}
            title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
            disabled={!canPublish || parsedObject == undefined}
            onClick={onPublishClicked}
          ></StyledButton>

          <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
            <Typography color="text.secondary" variant="body2" component="label">
              Linear Speed
            </Typography>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <StyledButton
                variant="contained"
                size="large"
                buttonColor={buttonColor ? buttonColor : undefined}
                title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
                disabled={!canPublish || parsedObject == undefined}
                onClick={onPublishClicked}
              ></StyledButton>
              <StyledButton
                variant="contained"
                size="large"
                buttonColor={buttonColor ? buttonColor : undefined}
                title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
                disabled={!canPublish || parsedObject == undefined}
                onClick={onPublishClicked}
              ></StyledButton>
            </Stack>
          </Stack>

          <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
            <Typography color="text.secondary" variant="body2" component="label">
              Angular Speed
            </Typography>
            <Stack alignItems="baseline" gap={1} padding={0.5} direction="row" flexShrink={0}>
              <StyledButton
                variant="contained"
                size="large"
                buttonColor={buttonColor ? buttonColor : undefined}
                title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
                disabled={!canPublish || parsedObject == undefined}
                onClick={onPublishClicked}
              ></StyledButton>
              <StyledButton
                variant="contained"
                size="large"
                buttonColor={buttonColor ? buttonColor : undefined}
                title={canPublish ? buttonTooltip : "Connect to ROS to publish data"}
                disabled={!canPublish || parsedObject == undefined}
                onClick={onPublishClicked}
              ></StyledButton>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>

    /*
    ><div style = {{

      backgroundImage: "url(" + "C:/Users/mrdav/Desktop" + ")"}}>

    </div>
    */
  );
}

export default Panel(
  Object.assign(React.memo(Publish), {
    panelType: "Publish",
    defaultConfig: {
      topicName: "/crop_rows",
      datatype: "row_info/Croprow",
      buttonText: "test",
      buttonTooltip: "",
      buttonColor: "#00A871",
      advancedView: true,
      value: "",
    },
  }),
);
