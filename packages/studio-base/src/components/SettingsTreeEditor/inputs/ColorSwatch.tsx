// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { HTMLAttributes } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles<{ color: string }>()((theme, { color }) => ({
  root: {
    aspectRatio: "1/1",
    width: theme.spacing(3),
    margin: theme.spacing(0.625),
    borderRadius: 1,
    backgroundColor: color,
    border: `1px solid ${theme.palette.getContrastText(color)}`,
  },
}));

export function ColorSwatch(
  props: { color: string } & HTMLAttributes<HTMLDivElement>,
): JSX.Element {
  const { className, color } = props;
  const { classes, cx } = useStyles({ color });
  return <div className={cx(className, classes.root)} {...props} />;
}
