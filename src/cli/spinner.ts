import chalk from 'chalk'

const frames = [
  chalk`{bold }     ASTX     `,
  chalk`{bold ▰}    ASTX     `,
  chalk`{bold ▰▰}   ASTX     `,
  chalk`{bold ▰▰▰}  ASTX     `,
  chalk` {bold ▰▰▰} ASTX     `,
  chalk`  {bold ▰▰▰}ASTX     `,
  chalk`   {bold ▰▰A}STX     `,
  chalk`    {bold ▰AS}TX     `,
  chalk`     {bold AST}X     `,
  chalk`     A{bold STX}     `,
  chalk`     AS{bold TX▰}    `,
  chalk`     AST{bold X▰▰}   `,
  chalk`     ASTX{bold ▰▰▰}  `,
  chalk`     ASTX {bold ▰▰▰} `,
  chalk`     ASTX  {bold ▰▰▰}`,
  chalk`     ASTX   {bold ▰▰}`,
  chalk`     ASTX    {bold ▰}`,
]

let start: number | undefined

export function spinner(): string {
  if (start == null) start = Date.now()
  return frames[Math.floor((Date.now() - start) / 120) % frames.length]
}
