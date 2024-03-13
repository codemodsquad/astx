import lodashFp from 'lodash/fp'
const { flow } = lodashFp

function pipeline<T0, T1>(t: T0, t0: (t: T0) => T1): T1
function pipeline<T0, T1, T2>(t: T0, t0: (t: T0) => T1, t1: (t: T1) => T2): T2
function pipeline<T0, T1, T2, T3>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3
): T3
function pipeline<T0, T1, T2, T3, T4>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3,
  t3: (t: T3) => T4
): T4
function pipeline<T0, T1, T2, T3, T4, T5>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3,
  t3: (t: T3) => T4,
  t4: (t: T4) => T5
): T5
function pipeline<T0, T1, T2, T3, T4, T5, T6>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3,
  t3: (t: T3) => T4,
  t4: (t: T4) => T5,
  t5: (t: T5) => T6
): T6
function pipeline<T0, T1, T2, T3, T4, T5, T6, T7>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3,
  t3: (t: T3) => T4,
  t4: (t: T4) => T5,
  t5: (t: T5) => T6,
  t6: (t: T6) => T7
): T7
function pipeline<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
  t: T0,
  t0: (t: T0) => T1,
  t1: (t: T1) => T2,
  t2: (t: T2) => T3,
  t3: (t: T3) => T4,
  t4: (t: T4) => T5,
  t5: (t: T5) => T6,
  t6: (t: T6) => T7,
  t7: (t: T7) => T8
): T8
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function pipeline(input: any, ...args: any[]): any {
  return flow(...args)(input)
}

export default pipeline
