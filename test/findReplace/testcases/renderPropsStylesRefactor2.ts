export const input = `
// @flow

import * as React from 'react'
import classNames from 'classnames'
import createStyled from 'material-ui-render-props-styles'
type Classes<Styles> = $Call<
  <T>((any) => T) => { [$Keys<T>]: string },
  Styles
>
import type {Theme} from '../../theme'
import TableBase from '@material-ui/core/Table'

const styles = (theme: Theme) => ({
  striped: {
    '& > tbody > tr': {
      height: theme.spacing(4),
      ...theme.mixins.stripedRow,
    },
    '& td': {
      border: 'none',
    },
  },
  root: {
    borderCollapse: 'separate',
    '$striped& > thead': {
      '& > tr:first-child': {
        height: theme.spacing(4),
        '& > th': {
          borderBottom: 'none',
        },
      },
    },
    '& > thead': {
      '& > tr:first-child': {
        height: theme.spacing(4),
        '& > th': {
          paddingTop: theme.spacing(2.5),
          paddingBottom: theme.spacing(0.5),
          color: theme.palette.text.primary,
          fontSize: theme.typography.pxToRem(17.5),
          fontWeight: 600,
        },
      },
      '& > tr:not(:first-child)': {
        height: theme.spacing(3),
        '& > th': {
          color: theme.palette.text.secondary,
          fontSize: theme.typography.pxToRem(15),
        },
      },
    },
    '& td, & th': {
      padding: theme.spacing(0.5),
      verticalAlign: 'middle',
    },
    '& td:first-child, & th:first-child': {
      ...theme.mixins.gutters(),
      '&:not(:last-child)': {
        paddingRight: 'initial',
      },
    },
    '& td:last-child, & th:last-child': {
      ...theme.mixins.gutters(),
      '&:not(:first-child)': {
        paddingLeft: 'initial',
      },
    },
    '& td': {
      fontSize: theme.typography.pxToRem(16),
      fontWeight: 'light',
    },
  },
})

export type Props = {
  +classes?: $Shape<Classes<typeof styles>>,
  +children?: ?React.Node,
  +striped?: ?boolean,
}

const TableStyles = createStyled(styles, {name: 'Table'})

const Table = ({classes, children, striped, ...props}: Props): React.Node => (
  <TableStyles classes={classes}>
    {({classes}: {classes: Classes<typeof styles>}) => (
      <TableBase
        {...props}
        className={classNames(
          classes.root,
          {[classes.striped]: striped !== false}
        )}
      >
        {children}
      </TableBase>
    )}
  </TableStyles>
)

export default Table
`

export const parsers = ['babylon-babel-generator']

export const find = `
import $createStyled from 'material-ui-render-props-styles'
$$a
const $Styles = createStyled($styles, $$rest)
$$b
const $Comp = ({$$props1, classes, $$props2, ...props}: $Props): $Ret => (
  <$Styles $$stylesProps>
    {({ $classes }: { $classes: $ClassesType }) => $elem}
  </$Styles>
)
`

export const replace = `
import { makeStyles } from '@material-ui/core/styles'
$$a
const useStyles = makeStyles($styles)
$$b
const $Comp = (inputProps: $Props): $Ret => {
  const $classes: $ClassesType = useStyles(inputProps)
  const {$$props1, $$props2, ...props} = inputProps
  return $elem
}
`

export const expectedReplace = `
// @flow

import * as React from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>;
import type { Theme } from "../../theme";
import TableBase from "@material-ui/core/Table";

const styles = (theme: Theme) => ({
  striped: {
    "& > tbody > tr": {
      height: theme.spacing(4),
      ...theme.mixins.stripedRow,
    },
    "& td": {
      border: "none",
    },
  },
  root: {
    borderCollapse: "separate",
    "$striped& > thead": {
      "& > tr:first-child": {
        height: theme.spacing(4),
        "& > th": {
          borderBottom: "none",
        },
      },
    },
    "& > thead": {
      "& > tr:first-child": {
        height: theme.spacing(4),
        "& > th": {
          paddingTop: theme.spacing(2.5),
          paddingBottom: theme.spacing(0.5),
          color: theme.palette.text.primary,
          fontSize: theme.typography.pxToRem(17.5),
          fontWeight: 600,
        },
      },
      "& > tr:not(:first-child)": {
        height: theme.spacing(3),
        "& > th": {
          color: theme.palette.text.secondary,
          fontSize: theme.typography.pxToRem(15),
        },
      },
    },
    "& td, & th": {
      padding: theme.spacing(0.5),
      verticalAlign: "middle",
    },
    "& td:first-child, & th:first-child": {
      ...theme.mixins.gutters(),
      "&:not(:last-child)": {
        paddingRight: "initial",
      },
    },
    "& td:last-child, & th:last-child": {
      ...theme.mixins.gutters(),
      "&:not(:first-child)": {
        paddingLeft: "initial",
      },
    },
    "& td": {
      fontSize: theme.typography.pxToRem(16),
      fontWeight: "light",
    },
  },
});

export type Props = {
  +classes?: $Shape<Classes<typeof styles>>,
  +children?: ?React.Node,
  +striped?: ?boolean,
};

const useStyles = makeStyles(styles);

const Table = (inputProps: Props): React.Node => {
  const classes: Classes<typeof styles> = useStyles(inputProps);

  const { children, striped, ...props } = inputProps;

  return (
    <TableBase
      {...props}
      className={classNames(classes.root, {
        [classes.striped]: striped !== false,
      })}
    >
      {children}
    </TableBase>
  );
};

export default Table;
`
