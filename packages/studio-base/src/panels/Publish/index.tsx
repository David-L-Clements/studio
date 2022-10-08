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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import positiontest from "./crop_row_position_test.png";
import singlerow from "./singlerow.png"

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

var mything = 1;

var row_states = [["Waiting","Waiting"],["Waiting","Waiting"],["Waiting","Waiting"],["Waiting","Waiting"],["Waiting","Waiting"]];

class RowInfo extends React.Component{
  constructor(props){
    super(props);
    this.state = {row_state: "Waiting"}
  }

  schedule_activity = () =>{
    // Change the state of the crop row
    if (this.state.row_state == "Waiting"){
      this.setState({
        row_state: "Scheduled"
      });
    } else {
      this.setState({
        row_state: "Waiting"
      });
    }

    // Publish this to the topic
    mything = mything + 1;
    //console.log(mything);

  }

  override render(): React.ReactNode {
    return(
      <div>
        <button onClick={this.schedule_activity}>{this.state.row_state}</button>
      </div>
    )
  }
}

function fRowInfo(){
  const [rowState, setRowState] = useState('Waiting');

  const schedule_activity = () =>{
    if (rowState == "Waiting"){
      useEffect(() => {
        setRowState('Scheduled')
      });
    } else {
      useEffect(() => {

      });
    }
  }

  return(
    <div>
      <button onClick={schedule_activity}>{rowState}</button>
    </div>
  )

}

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
      /*
      if (topicName.length !== 0 && top11 != undefined) {
        publish(top11 as Record<string, unknown>);
      } else {
        throw new Error(`called _publish() when input was invalid`);
      }*/
      console.log(row_states[0][0]);
      row_states[0][0] = "Scheduled";
      console.log(row_states[0][0]);

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

  const [rowState, setRowState] = useState([['Waiting', 'Waiting'], ['Waiting', 'Waiting'], ['Waiting', 'Waiting'], ['Waiting', 'Waiting'], ['Waiting', 'Waiting']]);

  const [rowState11, setRow11] = useState("Waiting");
  const [rowState12, setRow12] = useState("Waiting");
  const [rowState21, setRow21] = useState("Waiting");
  const [rowState22, setRow22] = useState("Waiting");
  const [rowState31, setRow31] = useState("Waiting");
  const [rowState32, setRow32] = useState("Waiting");
  const [rowState41, setRow41] = useState("Waiting");
  const [rowState42, setRow42] = useState("Waiting");
  const [rowState51, setRow51] = useState("Waiting");
  const [rowState52, setRow52] = useState("Waiting");

  const schedule_activity = (event, crop_index) =>{

    switch(crop_index){
      case '11':
        if (rowState11 == "Waiting"){
          setRow11("Scheduled")
          top11.command = 1;
          pub11

        } else{
          setRow11("Waiting")
          top11.command = 0;
          pub11;
        }
      break;

      case '12':
        if (rowState12 == "Waiting"){
          setRow12("Scheduled")
          top21.command = 1;
          pub21;
        } else{
          setRow12("Waiting")
          top21.command = 0
          pub21;
        }
      break;

      case '21':
        if (rowState21 == "Waiting"){
          setRow21("Scheduled")
          top12.command = 1;
          pub12;
        } else{
          setRow21("Waiting")
          top12.command = 0;
          pub12;
        }
      break;

      case '22':
        if (rowState22 == "Waiting"){
          setRow22("Scheduled")
          top22.command = 1;
          pub22;
        } else{
          setRow22("Waiting")
          top22.command = 0;
          pub22;
        }
      break;

      case '31':
        if (rowState31 == "Waiting"){
          setRow31("Scheduled")
          top13.command = 1;
          pub13;
        } else{
          setRow31("Waiting")
          top13.command = 0;
          pub13;
        }
      break;

      case '32':
        if (rowState32 == "Waiting"){
          setRow32("Scheduled")
          top23.command = 1;
          pub23;
        } else{
          setRow32("Waiting")
          top23.command = 0;
          pub23;
        }
      break;

      case '41':
        if (rowState41 == "Waiting"){
          setRow41("Scheduled")
          top14.command = 1;
          pub14;
        } else{
          setRow41("Waiting")
          top14.command = 0;
          pub14;
        }
      break;

      case '42':
        if (rowState42 == "Waiting"){
          setRow42("Scheduled")
          top24.command = 1;
          pub24;
        } else{
          setRow42("Waiting")
          top24.command = 0;
          pub24;
        }
      break;

      case '51':
        if (rowState11 == "Waiting"){
          setRow51("Scheduled")
          top15.command = 1;
          pub15;
        } else{
          setRow51("Waiting")
          top15.command = 0;
          pub15;
        }
      break;

      case '52':
        if (rowState11 == "Waiting"){
          setRow52("Scheduled")
          top25.command = 1;
          pub25;
        } else{
          setRow52("Waiting")
          top25.command = 0;
          pub25;
        }
      break;

    }
    /*
    if (rowState == "Waiting"){

      var temp = rowState;
      temp[columnNumber][rowNumber] = 'Scheduled'
      setRowState(temp)
      //console.log(rowNumber);


      //publish(top11 as Record<string, unknown>);
    } else {
      var temp = rowState;
      temp[columnNumber][rowNumber] = 'Scheduled'
      setRowState(temp)
      console.log(rowState)
    }
    */
  }


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
      backgroundImage: `url(${positiontest})`,
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

          <Stack direction="row" alignItems="center" padding={10} >
            <Stack direction="column" gap = {5} padding = {10}>

              <button onClick={event => schedule_activity(event,'11')}>{rowState11}</button>
              <button onClick={event => schedule_activity(event,'12')}>{rowState12}</button>


            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>

              <button onClick={event => schedule_activity(event,'21')}>{rowState21}</button>
              <button onClick={event => schedule_activity(event,'22')}>{rowState22}</button>


            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>

              <button onClick={event => schedule_activity(event,'31')}>{rowState31}</button>
              <button onClick={event => schedule_activity(event,'32')}>{rowState32}</button>

            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>

              <button onClick={event => schedule_activity(event,'41')}>{rowState41}</button>
              <button onClick={event => schedule_activity(event,'42')}>{rowState42}</button>

            </Stack>

            <Stack direction="column" gap = {5} padding = {10}>

              <button onClick={event => schedule_activity(event,'51')}>{rowState51}</button>
              <button onClick={event => schedule_activity(event,'52')}>{rowState52}</button>

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
