import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  input: `
class Connection extends Model<ConnectionAttributes, ConnectionInitAttributes> {
  declare Channels: Array<ConnectionChannel>;
  static Channels: Association.HasMany<
    Connection,
    ConnectionChannelAttributes,
    ConnectionChannelInitAttributes,
    ConnectionChannel
  > = null
}    
  `,
  astx: ({ astx }: TransformOptions): void => {
    for (const {
      $$body,
    } of astx.find`class $C extends Model<$$A> { $$body }`()) {
      $$body.find`class X { /**/ static $a: Association.HasMany<$$p> = $Maybe($i)}`()
        .replace`class X { /**/ declare static $a: any; }`()
    }
  },
  expected: `
class Connection extends Model<ConnectionAttributes, ConnectionInitAttributes> {
  declare Channels: Array<ConnectionChannel>;
  declare static Channels: any;
}    
  `,
})
