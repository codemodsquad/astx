export const input = `
/**
 * @flow
 * @prettier
 */
import * as React from 'react'
import CodeInput from './CodeInput'
import { type FieldProps } from 'redux-form'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'

import FormLabel from '@material-ui/core/FormLabel'

import createStyled from 'material-ui-render-props-styles'
type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>
import type { Theme } from '../theme'

export type CodeInputFieldProps = FieldProps & {
  label?: ?React.Node,
  length: number,
  classes?: ?Classes<typeof codeInputFieldStyles>,
  CodeInputProps?: ?$Shape<React.ElementConfig<typeof CodeInput>>,
}

const codeInputFieldStyles = (theme: Theme) => ({
  root: {},
  formLabel: {
    marginBottom: theme.spacing(1),
  },
  formHelperText: {},
})

const CodeInputFieldStyles = createStyled(codeInputFieldStyles, {
  name: 'CodeInputField',
})

const CodeInputField = ({
  input: { value, onChange },
  meta: { touched, error, warning },
  length,
  label,
  classes,
  CodeInputProps,
  ...props
}: CodeInputFieldProps): React.Node => (
  <CodeInputFieldStyles classes={classes}>
    {({ classes }: { classes: Classes<typeof codeInputFieldStyles> }) => (
      <FormControl
        error={touched && (error || warning) != null}
        classes={{ root: classes.root }}
      >
        {label && <FormLabel className={classes.formLabel}>{label}</FormLabel>}
        <CodeInput
          {...props}
          {...CodeInputProps}
          length={length}
          value={value}
          onChange={onChange}
        />
        {touched && (error || warning) != null && (
          <FormHelperText variant="standard" className={classes.formHelperText}>
            {error || warning}
          </FormHelperText>
        )}
      </FormControl>
    )}
  </CodeInputFieldStyles>
)

export default CodeInputField
`

export const parsers = ['babel', 'recast/babel-generator']

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
/**
 * @flow
 * @prettier
 */
import * as React from 'react'
import CodeInput from './CodeInput'
import { type FieldProps } from 'redux-form'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'

import FormLabel from '@material-ui/core/FormLabel'

import { makeStyles } from '@material-ui/core/styles'
type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>
import type { Theme } from '../theme'

export type CodeInputFieldProps = FieldProps & {
  label?: ?React.Node,
  length: number,
  classes?: ?Classes<typeof codeInputFieldStyles>,
  CodeInputProps?: ?$Shape<React.ElementConfig<typeof CodeInput>>,
}

const codeInputFieldStyles = (theme: Theme) => ({
  root: {},
  formLabel: {
    marginBottom: theme.spacing(1),
  },
  formHelperText: {},
})

const useStyles = makeStyles(codeInputFieldStyles)

const CodeInputField = (inputProps: CodeInputFieldProps): React.Node => {
  const classes: Classes<typeof codeInputFieldStyles> = useStyles(inputProps)

  const {
    input: { value, onChange },

    meta: { touched, error, warning },

    length,
    label,
    CodeInputProps,
    ...props
  } = inputProps

  return (
    <FormControl
      error={touched && (error || warning) != null}
      classes={{
        root: classes.root
      }}
    >
      {label && <FormLabel className={classes.formLabel}>{label}</FormLabel>}
      <CodeInput
        {...props}
        {...CodeInputProps}
        length={length}
        value={value}
        onChange={onChange}
      />
      {touched && (error || warning) != null && (
        <FormHelperText variant="standard" className={classes.formHelperText}>
          {error || warning}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default CodeInputField
`
