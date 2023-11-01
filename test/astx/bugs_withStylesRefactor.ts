import dedent from 'dedent-js'
import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  parsers: ['babel/tsx'],
  input: dedent`
    import * as React from 'react'
    import { NavLink } from 'react-router-dom'
    import ListItem from '@material-ui/core/ListItem'
    import { withStyles } from '@material-ui/core/styles'
    import type { Theme } from '../../theme'
    import classNames from 'classnames'
    export const SIDEBAR_ITEM_HEIGHT = 30
    
    const sidebarItemStyles = (theme: Theme): {} => {
      // eslint-disable-line flowtype/require-return-type
      return {
        root: {
          position: 'relative',
          paddingLeft: theme.spacing(3.5),
          height: SIDEBAR_ITEM_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: theme.spacing(2),
        },
        active: {
          backgroundColor: 'rgba(255,255,255,0.2)',
          '&:focus': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.25)',
          },
        },
      }
    }
    
    export type SidebarItemProps = {
      classes: Classes
      children: React.ReactNode
      className?: string
      component?: ListItem['component'] | null | undefined
    }
    const SidebarItem = withStyles(sidebarItemStyles)(
      ({
        classes,
        className,
        children,
        ...props
      }: SidebarItemProps): React.ReactElement => {
        if (props.component === NavLink)
          (props as any).activeClassName = classes.active
        return (
          <ListItem
            {...props}
            button
            className={classNames(classes.root, className)}
          >
            {children}
          </ListItem>
        )
      }
    )
    export default SidebarItem
  `,
  astx: ({ astx }: TransformOptions): void => {
    const styleFn = astx.find`(theme: Theme): $Maybe<$Ret> => $body`()
    styleFn.$body.destruct`({ $$props })`().replace`({ $$props } as const)`()
    styleFn.$body.find`return { $$props }`()
      .replace`return { $$props } as const`()

    styleFn.destruct`($$args): $Ret => $body`().replace`($$args) => $body`()
  },
  expected: dedent`
    import * as React from 'react'
    import { NavLink } from 'react-router-dom'
    import ListItem from '@material-ui/core/ListItem'
    import { withStyles } from '@material-ui/core/styles'
    import type { Theme } from '../../theme'
    import classNames from 'classnames'
    export const SIDEBAR_ITEM_HEIGHT = 30
    
    const sidebarItemStyles = (theme: Theme) => {
      // eslint-disable-line flowtype/require-return-type
      return ({
        root: {
          position: 'relative',
          paddingLeft: theme.spacing(3.5),
          height: SIDEBAR_ITEM_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: theme.spacing(2),
        },
        active: {
          backgroundColor: 'rgba(255,255,255,0.2)',
          '&:focus': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.25)',
          },
        }
      } as const);
    };
    
    export type SidebarItemProps = {
      classes: Classes
      children: React.ReactNode
      className?: string
      component?: ListItem['component'] | null | undefined
    }
    const SidebarItem = withStyles(sidebarItemStyles)(
      ({
        classes,
        className,
        children,
        ...props
      }: SidebarItemProps): React.ReactElement => {
        if (props.component === NavLink)
          (props as any).activeClassName = classes.active
        return (
          <ListItem
            {...props}
            button
            className={classNames(classes.root, className)}
          >
            {children}
          </ListItem>
        )
      }
    )
    export default SidebarItem    
  `,
})
