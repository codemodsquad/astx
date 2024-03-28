import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  parsers: ['babel/tsx'],
  input: dedent`
    import * as React from 'react'
    import { withRouter } from 'react-router-dom'
    import type { LocationShape, RouterHistory } from 'react-router-dom'
    export type Props = {
      history: RouterHistory
      to: string | LocationShape
      replace?: boolean
      children: (props: ChildProps) => React.ReactElement
    }
    export type ChildProps = {
      bind: {
        onClick: (e: Event) => any
      }
    }
    class WorkaroundLink extends React.Component<Props> {
      _handleClick = () => {
        const { history, to, replace } = this.props
        if (replace) history.replace(to)
        else history.push(to)
      }
      render(): React.ReactElement {
        const { children } = this.props
        return children({
          bind: {
            onClick: this._handleClick,
          },
        })
      }
    }
    export default withRouter(WorkaroundLink as any)
  `,
  astx: ({ astx }: TransformOptions) => {
    if (
      !astx.find(
        (a) =>
          a.node.type === 'ImportDeclaration' &&
          a.node.source.value === 'react-router-dom'
      ).matched
    ) {
      return null
    }

    const stringOrLocationShapeMatch =
      astx.find`type T = /**/ string | LocationShape`().matched
    if (stringOrLocationShapeMatch) {
      astx.replaceImport`import { type LocationShape } from 'react-router-dom'`()
        .with`import type { LocationDescriptor } from 'history'`()
      astx.addImports`import type { LocationState } from '${'../react-router/LocationState'}'`()
      stringOrLocationShapeMatch.replace`LocationDescriptor<LocationState>`()
    }
  },
  expected: dedent`
    import * as React from 'react'
    import { withRouter } from 'react-router-dom'
    import type { RouterHistory } from 'react-router-dom'
    import type { LocationDescriptor } from 'history'
    import type { LocationState } from '../react-router/LocationState'
    export type Props = {
      history: RouterHistory
      to: LocationDescriptor<LocationState>
      replace?: boolean
      children: (props: ChildProps) => React.ReactElement
    }
    export type ChildProps = {
      bind: {
        onClick: (e: Event) => any
      }
    }
    class WorkaroundLink extends React.Component<Props> {
      _handleClick = () => {
        const { history, to, replace } = this.props
        if (replace) history.replace(to)
        else history.push(to)
      }
      render(): React.ReactElement {
        const { children } = this.props
        return children({
          bind: {
            onClick: this._handleClick,
          },
        })
      }
    }
    export default withRouter(WorkaroundLink as any)    
  `,
})
