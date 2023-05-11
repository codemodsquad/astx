import { Statement, TransformOptions } from '../../../src'

export const parsers = ['recast/babel']

export const input = `
/**
 * @flow
 * @prettier
 */

import * as React from 'react'
import gql from 'graphql-tag'
import {
  Subscription,
  type SubscriptionResult,
  type OnSubscriptionDataOptions,
} from '@apollo/react-components'
import warning from 'warning'
import { type TagNotificationFields } from '../../types/TagNotificationTypes'

// @graphql-to-flow external: JSON = TagNotificationFields
// @graphql-to-flow extract: TagNotificationsSubscriberFragment = TagNotification
const fragment = gql\`
  fragment TagNotificationsSubscriberFragment on TagNotification {
    id
    userId
    createdAt
    tag
    triggered
    triggerId
    variant
    fields
    severity
    acknowledged
    message
  }
\`

/* eslint-enable no-unused-vars */
const subscription = gql\`
  \${fragment}
  subscription TagNotificationsSubscriber {
    TagNotifications {
      added {
        ...TagNotificationsSubscriberFragment
      }
      changed {
        ...TagNotificationsSubscriberFragment
      }
      removed {
        ...TagNotificationsSubscriberFragment
      }
    }
  }
\`

// @graphql-to-flow auto-generated
type SubscriptionData = {
  TagNotifications: ?{
    added: ?Array<TagNotification>,
    changed: ?Array<TagNotification>,
    removed: ?Array<TagNotification>,
  },
}

/* eslint-enable no-unused-vars */
export type TagNotificationsSubscriptionData = SubscriptionData

// @graphql-to-flow auto-generated
type TagNotification = {
  id: number,
  userId: number,
  createdAt: mixed,
  tag: string,
  triggered: ?boolean,
  triggerId: ?number,
  variant: string,
  fields: TagNotificationFields,
  severity: ?('WARNING' | 'ALARM' | 'CRITICAL'),
  acknowledged: boolean,
  message: ?string,
}

/* eslint-enable no-unused-vars */
type SubscriptionDataListener = (
  OnSubscriptionDataOptions<SubscriptionData>
) => any

export type Props = {
  children?: ?React.Node,
}

type TagNotificationsSubscriptionContextValue = {|
  addListener: (listener: SubscriptionDataListener) => void,
  removeListener: (listener: SubscriptionDataListener) => void,
|}

export const TagNotificationsSubscriptionContext: React.Context<TagNotificationsSubscriptionContextValue> =
  React.createContext({
    addListener(listener: SubscriptionDataListener) {},
    removeListener(listener: SubscriptionDataListener) {},
  })

export default class TagNotificationsSubscriber extends React.Component<Props> {
  _subscriptionDataListeners: Set<SubscriptionDataListener> = new Set()

  _contextValue: TagNotificationsSubscriptionContextValue = {
    addListener: (listener: SubscriptionDataListener) => {
      this._subscriptionDataListeners.add(listener)
    },
    removeListener: (listener: SubscriptionDataListener) => {
      this._subscriptionDataListeners.delete(listener)
    },
  }

  handleSubscriptionData = (arg: {
    client: any,
    subscriptionData: SubscriptionResult<SubscriptionData>,
  }) => {
    this._subscriptionDataListeners.forEach(
      (listener: SubscriptionDataListener) => {
        try {
          listener(arg)
        } catch (error) {
          warning(false, error.stack)
        }
      }
    )
  }

  render(): React.Node {
    const { children } = this.props
    return (
      <TagNotificationsSubscriptionContext.Provider value={this._contextValue}>
        <Subscription
          subscription={subscription}
          onSubscriptionData={this.handleSubscriptionData}
        />
        {children}
      </TagNotificationsSubscriptionContext.Provider>
    )
  }
}

export type TagNotificationsListenerProps = {
  onSubscriptionData: SubscriptionDataListener,
}

export class TagNotificationsListener extends React.Component<TagNotificationsListenerProps> {
  static contextType = TagNotificationsSubscriptionContext

  componentDidMount() {
    this.context.addListener(this._handleSubscriptionData)
  }

  componentWillUnmount() {
    this.context.removeListener(this._handleSubscriptionData)
  }

  _handleSubscriptionData: SubscriptionDataListener = (
    options: OnSubscriptionDataOptions<SubscriptionData>
  ) => {
    const { onSubscriptionData } = this.props
    if (onSubscriptionData) onSubscriptionData(options)
  }

  render(): React.Node {
    return null
  }
}
`

export function astx({ astx, statement }: TransformOptions): void {
  const { $React } = astx.find`import * as $React from 'react'`()
  if (!$React.size) return

  for (const comp of astx.find`
    class $C extends ${$React}.Component<$Props> {
      render(): $Maybe<$Node> { $$render }
      $$$body
    }
  `()) {
    const { $C, $Props, $$$body, $Node, $$render } = comp
    comp.find`this.$x`().replace`$x`()

    const decls: Statement[] = []

    const { $contextType } =
      $$$body.find`class X { /**/ static contextType = $contextType }`()
    if ($contextType.size) {
      decls.push(
        statement`const context = ${$React}.useContext(${$contextType})`
      )
    }

    for (const prop of $$$body.find`class X { /**/ $name: $Maybe<$Type> = $value }`()) {
      const { $name, $Type, $value } = prop
      const valueFn = $value.find`($$args): $Maybe<$Ret> => $expr`()
      if (valueFn.size && valueFn.node === $value.node) {
        decls.push(
          $Type.size
            ? statement`const ${$name}: ${$Type} = ${$React}.useCallback(${$value}, [])`
            : statement`const ${$name} = ${$React}.useCallback(${$value}, [])`
        )
      } else {
        decls.push(
          $Type.size
            ? statement`const ${$name}: ${$Type} = ${$React}.useMemo(() => ${$value}, [])`
            : statement`const ${$name} = ${$React}.useMemo(() => ${$value}, [])`
        )
      }
    }

    const { $$didMount } =
      $$$body.find`class X { /**/ componentDidMount(): $Maybe<$> { $$didMount } }`()
    if ($$didMount.size) {
      decls.push(statement`${$React}.useEffect(() => { ${$$didMount} }, [])`)
    }

    const { $$didUnmount } =
      $$$body.find`class X { /**/ componentWillUnmount(): $Maybe<$> { $$didUnmount } }`()
    if ($$didUnmount.size) {
      decls.push(
        statement`${$React}.useEffect(() => () => { ${$$didUnmount} }, [])`
      )
    }

    if ($Node.size) {
      comp.replace`function ${$C}(props: ${$Props}): ${$Node} {
        ${decls}
        ${$$render}
      }`()
    } else {
      comp.replace`function ${$C}(props: ${$Props}) {
        ${decls}
        ${$$render}
      }`()
    }
  }
}

export const expectedReports = []

export const only = true
export const expected = `
/**
 * @flow
 * @prettier
 */

import * as React from 'react';
import gql from 'graphql-tag';
import { Subscription, type SubscriptionResult, type OnSubscriptionDataOptions } from '@apollo/react-components';
import warning from 'warning';
import { type TagNotificationFields } from '../../types/TagNotificationTypes';

// @graphql-to-flow external: JSON = TagNotificationFields
// @graphql-to-flow extract: TagNotificationsSubscriberFragment = TagNotification
const fragment = gql\`
  fragment TagNotificationsSubscriberFragment on TagNotification {
    id
    userId
    createdAt
    tag
    triggered
    triggerId
    variant
    fields
    severity
    acknowledged
    message
  }
\`;

/* eslint-enable no-unused-vars */
const subscription = gql\`
  \${fragment}
  subscription TagNotificationsSubscriber {
    TagNotifications {
      added {
        ...TagNotificationsSubscriberFragment
      }
      changed {
        ...TagNotificationsSubscriberFragment
      }
      removed {
        ...TagNotificationsSubscriberFragment
      }
    }
  }
\`;

// @graphql-to-flow auto-generated
type SubscriptionData = {
  TagNotifications: ?{
    added: ?Array<TagNotification>,
    changed: ?Array<TagNotification>,
    removed: ?Array<TagNotification>,
  },
}

/* eslint-enable no-unused-vars */
export type TagNotificationsSubscriptionData = SubscriptionData;

// @graphql-to-flow auto-generated
type TagNotification = {
  id: number,
  userId: number,
  createdAt: mixed,
  tag: string,
  triggered: ?boolean,
  triggerId: ?number,
  variant: string,
  fields: TagNotificationFields,
  severity: ?('WARNING' | 'ALARM' | 'CRITICAL'),
  acknowledged: boolean,
  message: ?string,
}

/* eslint-enable no-unused-vars */
type SubscriptionDataListener = (
  OnSubscriptionDataOptions<SubscriptionData>
) => any

export type Props = {
  children?: ?React.Node,
};

type TagNotificationsSubscriptionContextValue = {|
  addListener: (listener: SubscriptionDataListener) => void,
  removeListener: (listener: SubscriptionDataListener) => void,
|}

export const TagNotificationsSubscriptionContext: React.Context<TagNotificationsSubscriptionContextValue> = React.createContext({
  addListener(listener: SubscriptionDataListener) {},
  removeListener(listener: SubscriptionDataListener) {},
});

export default function TagNotificationsSubscriber(props: Props): React.Node {
  const _subscriptionDataListeners: Set<SubscriptionDataListener> = React.useMemo(() => new Set(), []);

  const _contextValue: TagNotificationsSubscriptionContextValue = React.useMemo(() => ({
    addListener: (listener: SubscriptionDataListener) => {
      _subscriptionDataListeners.add(listener);
    },

    removeListener: (listener: SubscriptionDataListener) => {
      _subscriptionDataListeners.delete(listener);
    }
  }), []);

  const handleSubscriptionData = React.useCallback((
    arg: {
      client: any,
      subscriptionData: SubscriptionResult<SubscriptionData>,
    }
  ) => {
    _subscriptionDataListeners.forEach((listener: SubscriptionDataListener) => {
      try {
        listener(arg);
      } catch (error) {
        warning(false, error.stack);
      }
    });
  }, []);

  const {
    children
  } = props;

  return (
    <TagNotificationsSubscriptionContext.Provider value={_contextValue}>
      <Subscription subscription={subscription} onSubscriptionData={handleSubscriptionData} />
      {children}
    </TagNotificationsSubscriptionContext.Provider>
  );
}

export type TagNotificationsListenerProps = {
  onSubscriptionData: SubscriptionDataListener,
};

export function TagNotificationsListener(props: TagNotificationsListenerProps): React.Node {
  const context = React.useContext(TagNotificationsSubscriptionContext);

  const _handleSubscriptionData: SubscriptionDataListener = React.useCallback((options: OnSubscriptionDataOptions<SubscriptionData>) => {
    const {
      onSubscriptionData
    } = props;

    if (onSubscriptionData)
      onSubscriptionData(options);
  }, []);

  React.useEffect(() => {
    context.addListener(_handleSubscriptionData);
  }, []);

  React.useEffect(() => () => {
    context.removeListener(_handleSubscriptionData);
  }, []);

  return null;
}
`
