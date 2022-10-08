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


export default function CropPublishButton(){
    const [rowState, setRowState] = useState('Waiting');

    const schedule_activity = () =>{
      if (rowState == "Waiting"){
        setRowState('Scheduled')
      } else {
        setRowState('Scheduled')
      }
    }

    return(
      <div>
        <button onClick={schedule_activity}>{rowState}</button>
      </div>
    )

  }
